import { FileTreeProps as TreeProps, FileTree as Tree, TreeNode } from '@sinm/react-file-tree';

// default style
import '@sinm/react-file-tree/styles.css';
import '@sinm/react-file-tree/icons.css';
import { useEffect, useState } from 'react';
import FileItemWithFileIcon from '@sinm/react-file-tree/lib/FileItemWithFileIcon';
import { utils } from "@sinm/react-file-tree";
import { Socket } from 'socket.io-client';
import orderBy from "lodash/orderBy";

const itemRenderer = (treeNode: TreeNode) => <FileItemWithFileIcon treeNode={treeNode} />


interface FileTreeProps {
  selectedFile: string
  rootDir: TreeNode
  socket: Socket
  setSelectedFile: (filePath: string) => void
}



export const FileTree = ({ rootDir, socket, setSelectedFile, selectedFile }: FileTreeProps) => {
  console.log(rootDir)
  const [tree, setTree] = useState<TreeNode>(rootDir)

  useEffect(() => {
    socket.on('nestedFiles', ({ uri, nestedFiles }: { uri: string, nestedFiles: TreeNode }) => {
      utils.appendTreeNode(tree, uri, nestedFiles)
    })
  }, [])

  const toggleExpanded: TreeProps["onItemClick"] = (treeNode) => {
    console.log(selectedFile, treeNode)
    if (treeNode.type === 'directory' && !treeNode.children?.length) {
      fetchNestedFiles(treeNode.uri);
    }
    if (treeNode.type === "file") {
      setSelectedFile(treeNode.uri)
    }
    setTree((tree) =>
      utils.assignTreeNode(tree, treeNode.uri, { expanded: !treeNode.expanded })!
    );
  };

  const fetchNestedFiles = (uri: string) => {
    socket.emit('getNestedFiles', { uri });
  };

  const sorter = (treeNodes: TreeNode[]) =>
    orderBy(
      treeNodes,
      [
        (node) => (node.type === "directory" ? 0 : 1),
        (node) => utils.getFileName(node.uri),
      ],
      ["asc", "asc"]
    );

  return (
    <Tree
      activatedUri={selectedFile}
      tree={tree}
      onItemClick={toggleExpanded}
      sorter={sorter}
      itemRenderer={itemRenderer}
    />
  )

}
