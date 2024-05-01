import {
  FileTreeProps as TreeProps, FileTree as Tree
} from '@sinm/react-file-tree';

// default style
import '@sinm/react-file-tree/styles.css';
import '@sinm/react-file-tree/icons.css';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import FileItemWithFileIcon from '@sinm/react-file-tree/lib/FileItemWithFileIcon';
import { utils } from "@sinm/react-file-tree";
import { Socket } from 'socket.io-client';
import orderBy from "lodash/orderBy";
import { FileTreeType, SelectedFileType } from '@/app/playground/page';
import { TreeNode } from '@sinm/react-file-tree';
import { FilePlus2, } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { ContextMenuContent, ContextMenuItem, ContextMenu, ContextMenuTrigger } from './ui/context-menu';


interface FileTreeProps {
  selectedFile: SelectedFileType
  rootDir: FileTreeType
  socket: Socket
  setSelectedFile: (file: SelectedFileType) => void
  setRootDir: Dispatch<SetStateAction<FileTreeType | undefined>>
}

export const FileTree = ({ rootDir, socket, setSelectedFile, selectedFile, setRootDir }: FileTreeProps) => {

  const { toast } = useToast()
  const [toggledInput, setToggleInput] = useState(false)
  const [fileName, setFileName] = useState('')
  const [openedDir, setOpenedDir] = useState(rootDir.uri)


  useEffect(() => {
    socket.on('nestedFiles', ({ uri, nestedFiles }: { uri: string, nestedFiles: FileTreeType }) => {
      setRootDir((tree: FileTreeType | undefined) =>
        utils.assignTreeNode(tree, uri, { children: nestedFiles.children })!
      );

      utils.appendTreeNode(rootDir, uri, nestedFiles)
    })
  }, [])

  const toggleExpanded: TreeProps["onItemClick"] = (treeNode: TreeNode,) => {
    if (treeNode.type === 'directory' && !treeNode.children?.length) {
      setOpenedDir(treeNode.uri)
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
  };

  const fetchNestedFiles = (uri: string) => {
    socket.emit('getNestedFiles', { uri });
  };


  const handleCreate = () => {
    const invalidCharsRegex = /[:\\,?]/
    if (fileName.length === 0) return toast({ title: 'filename required', description: "please enter a file name ", variant: "destructive" })
    if (invalidCharsRegex.test(fileName)) return toast({ title: 'Invalid filename ', description: "please enter a valid filename ", variant: "destructive" })

    socket.emit("createNew", { fileName, uri: openedDir })
    setFileName('')
    setToggleInput(false)
  }

  const handleDelete = (uri: string) => {
    socket.emit("delete", { uri })

  }

  return (
    <div className=' h-full'>
      <div className='flex flex-row items-center justify-between gap-x-4 h-16 '>

        <div className='w-4/5 p-2'>
          {toggledInput && <input
            value={fileName}
            autoFocus={true}
            className='w-full px-2 py-1 rounded-sm text-foreground/40 '
            onChange={(e) => setFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
            }}
          />}
        </div>
        <div className='flex justify-end gap-x-4'>
          <FilePlus2 size={20} className='cursor-pointer' onClick={() => setToggleInput(!toggledInput)} />
        </div>
      </div>
      <Tree
        activatedUri={selectedFile?.uri ?? ""}
        tree={rootDir}
        onItemClick={toggleExpanded}
        sorter={sorter}
        itemRenderer={(props) => <ItemRenderer
          treeNode={props}
          handleDel={(uri: string) => handleDelete(uri)}
          setCurrentDir={(dir: string) => setOpenedDir(dir)}
          handleCreate={() => setToggleInput(true)}
          setRootDir={setRootDir}
        />}
      />
    </div>
  )
}

const sorter = (treeNodes: FileTreeType[]) =>
  orderBy(
    treeNodes,
    [
      (node) => (node.type === "directory" ? 0 : 1),
      (node) => utils.getFileName(node.uri),
    ],
    ["asc", "asc"]
  );




type ItemRendererProps = {
  treeNode: FileTreeType
  setRootDir: FileTreeProps['setRootDir']
  handleDel: (uri: string) => void
  handleCreate: () => void
  setCurrentDir: (uri: string) => void
}

const ItemRenderer = ({ treeNode, setRootDir, handleCreate, setCurrentDir, handleDel }: ItemRendererProps) => {
  const handleToggle = () => {
    setRootDir((tree: FileTreeType | undefined) =>
      utils.assignTreeNode(tree, treeNode.uri, { expanded: !treeNode.expanded })!
    );
  }

  const handleClickCreate = (uri: string) => {
    handleCreate()
    setCurrentDir(uri)
  }

  return (
    <div className="flex items-start w-3/4">
      <ContextMenu>
        <ContextMenuTrigger>
          <ContextMenuContent className='z-10'  >
            {treeNode?.type === 'directory' && <ContextMenuItem onClick={() => handleClickCreate(treeNode.uri)}>Create file</ContextMenuItem>}
            <ContextMenuItem onClick={() => handleDel(treeNode.uri)}>Delete file</ContextMenuItem>
          </ContextMenuContent>
          <div className='z-0' onClick={handleToggle}>
            <FileItemWithFileIcon treeNode={treeNode} />
          </div>
        </ContextMenuTrigger>
      </ContextMenu>
    </div>
  );
};

