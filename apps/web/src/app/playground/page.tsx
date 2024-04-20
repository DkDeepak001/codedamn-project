'use client'
import { Code } from "@/components/code-editor";
import { FileTree } from "@/components/file-tree";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import useSocket from "@/hooks/useSocket";
import { TreeNode } from "@sinm/react-file-tree";
import { useEffect, useState } from "react";
import _ from 'lodash';

export default function Playground() {

  const socket = useSocket()
  const [selectedFile, setSelectedFile] = useState<string>()
  const [serverFiles, setServerFiles] = useState<TreeNode>()
  const [recentFiles, setRecentFiles] = useState<string[]>([])
  useEffect(() => {
    if (!socket) return
    socket.on('getInitialFiles', ({ rootDir }: { rootDir: TreeNode }) => {
      setServerFiles({
        ...rootDir,
        expanded: true
      })
    });

  })
  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath)
    setRecentFiles((prev) => _.uniq([...prev, filePath]))
  }

  const handleRemoveFromRecent = (filePath: string) => {
    setRecentFiles((prev) => _.without(prev, filePath));
  }

  if (!serverFiles) return

  return (
    <div className="h-screen w-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={15} className="p-3">
          <FileTree
            selectedFile={selectedFile!}
            rootDir={serverFiles}
            socket={socket}
            setSelectedFile={(filePath: string) => handleFileSelect(filePath)} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={75}>
              <Code
                selectedFile={selectedFile!}
                recentFiles={recentFiles}
                setSelectedFile={(filePath: string) => setSelectedFile(filePath)}
                removeFromRecent={(filePath: string) => handleRemoveFromRecent(filePath)}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25}>Terminal</ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={35}>output</ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}


