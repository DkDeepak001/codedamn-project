'use client'
import { Code } from "@/components/code-editor";
import { FileTree } from "@/components/file-tree";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import useSocket from "@/hooks/useSocket";
import { TreeNode } from "@sinm/react-file-tree";
import { useEffect, useState } from "react";




export default function Playground() {

  const socket = useSocket()
  const [selectedFile, setSelectedFile] = useState<string>()
  const [serverFiles, setServerFiles] = useState<TreeNode>()
  useEffect(() => {
    if (!socket) return
    socket.on('getInitialFiles', ({ rootDir }: { rootDir: TreeNode }) => {
      setServerFiles({
        ...rootDir,
        expanded: true
      })
    });

  })
  if (!serverFiles) return

  return (
    <div className="h-screen w-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={15} className="p-3">
          <FileTree rootDir={serverFiles} socket={socket} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={75}>
              <Code selectedFile={selectedFile!} />
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


