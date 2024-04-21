'use client'
import { Code } from "@/components/code-editor";
import { FileTree } from "@/components/file-tree";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import useSocket from "@/hooks/useSocket";
import { TreeNode } from "@sinm/react-file-tree";
import { useEffect, useState } from "react";
import _ from 'lodash';
import { XTerminal } from "@/components/terminal";


export type FileTreeType = TreeNode & { content?: string }
export type SelectedFileType = Omit<FileTreeType, 'children' | 'expanded'>

export default function Playground() {

  const socket = useSocket()
  const [selectedFile, setSelectedFile] = useState<SelectedFileType>()
  const [serverFiles, setServerFiles] = useState<FileTreeType>()
  const [recentFiles, setRecentFiles] = useState<SelectedFileType[]>([])

  useEffect(() => {
    if (!socket) return
    socket.on('getInitialFiles', ({ rootDir }: { rootDir: FileTreeType }) => {
      setServerFiles({
        ...rootDir,
        expanded: true
      })
    });
  }, [socket])

  const handleFileSelect = (file: SelectedFileType) => {
    setSelectedFile(file);
    setRecentFiles((prev) => _.uniqBy([...prev, file], 'uri'));
  }

  const handleRemoveFromRecent = (file: SelectedFileType) => {
    setRecentFiles((prev) => _.reject(prev, { uri: file.uri }));
    setSelectedFile((prev) => {
      if (prev?.uri !== file.uri) return prev
      const last = recentFiles.indexOf(file)
      const prevFile = last === 0 ? recentFiles[last + 1] : recentFiles[last - 1]
      return prevFile
    });
  }

  if (!serverFiles) return

  return (
    <div className="h-screen w-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={15} className="p-3" minSize={5} maxSize={20}>
          <FileTree
            selectedFile={selectedFile!}
            rootDir={serverFiles}
            setRootDir={setServerFiles}
            socket={socket}
            setSelectedFile={(file: SelectedFileType) => handleFileSelect(file)} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={75}>
              <Code
                selectedFile={selectedFile!}
                recentFiles={recentFiles}
                setSelectedFile={(file: SelectedFileType) => setSelectedFile(file)}
                removeFromRecent={(file: SelectedFileType) => handleRemoveFromRecent(file)}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25} maxSize={42} minSize={25} className="p-2" >
              <XTerminal socket={socket} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={35}>output</ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}


