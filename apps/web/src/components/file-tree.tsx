import {
  FileTreeProps as TreeProps, FileTree as Tree
} from '@sinm/react-file-tree';

// default style
import '@sinm/react-file-tree/styles.css';
import '@sinm/react-file-tree/icons.css';
import { Dispatch, SetStateAction, useEffect } from 'react';
import FileItemWithFileIcon from '@sinm/react-file-tree/lib/FileItemWithFileIcon';
import { utils } from "@sinm/react-file-tree";
import { Socket } from 'socket.io-client';
import orderBy from "lodash/orderBy";
import { FileTreeType, SelectedFileType } from '@/app/playground/page';
import { TreeNode } from '@sinm/react-file-tree';

const itemRenderer = (treeNode: FileTreeType) => <FileItemWithFileIcon treeNode={treeNode} />

interface FileTreeProps {
  selectedFile: SelectedFileType
  rootDir: FileTreeType
  socket: Socket
  setSelectedFile: (file: SelectedFileType) => void
  setRootDir: Dispatch<SetStateAction<FileTreeType | undefined>>
}

export const FileTree = ({ rootDir, socket, setSelectedFile, selectedFile, setRootDir }: FileTreeProps) => {

  useEffect(() => {
    socket.on('nestedFiles', ({ uri, nestedFiles }: { uri: string, nestedFiles: FileTreeType }) => {
      utils.appendTreeNode(rootDir, uri, nestedFiles)
    })
  }, [])

  const toggleExpanded: TreeProps["onItemClick"] = (treeNode: TreeNode) => {
    console.log(selectedFile, treeNode)
    if (treeNode.type === 'directory' && !treeNode.children?.length) {
      fetchNestedFiles(treeNode.uri);
    }
    if (treeNode.type === "file") {
      socket.emit("loadFile", { uri: treeNode.uri }, (data: string) => {
        setSelectedFile({ type: treeNode.type, uri: treeNode.uri, content: data })
        setRootDir((tree: FileTreeType | undefined) =>
          utils.assignTreeNode(tree, treeNode.uri, { content: data } as Partial<FileTreeType>)!
        );
      })

    }
    setRootDir((tree: FileTreeType | undefined) =>
      utils.assignTreeNode(tree, treeNode.uri, { expanded: !treeNode.expanded })!
    );
  };

  const fetchNestedFiles = (uri: string) => {
    socket.emit('getNestedFiles', { uri });
  };

  const sorter = (treeNodes: FileTreeType[]) =>
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
      activatedUri={selectedFile.uri}
      tree={rootDir}
      onItemClick={toggleExpanded}
      sorter={sorter}
      itemRenderer={itemRenderer}
    />
  )

}
