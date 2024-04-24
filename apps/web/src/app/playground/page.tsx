'use client'
import { Code } from "@/components/code-editor";
import { FileTree } from "@/components/file-tree";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import useSocket from "@/hooks/useSocket";
import { TreeNode } from "@sinm/react-file-tree";
import { useEffect, useState } from "react";
import _ from 'lodash';
import { Output } from "@/components/output";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Projects } from "@repo/database";

const DynamicTerminalComponent = dynamic(() => import('@/components/terminal').then(m => m.XTerminal), {
  ssr: false
})

export type FileTreeType = TreeNode & { content?: string }
export type SelectedFileType = Omit<FileTreeType, 'children' | 'expanded'>

export default function Playground() {
  const projectId = useSearchParams().get('projectId')
  console.log(projectId)
  const [project, setProject] = useState<Projects>()

  useEffect(() => {
    if (!projectId) return

    const fetchUrl = async () => {
      const res = await fetch(`api/projects?projectId=${projectId}`, { method: "GET" })
      const data = await res.json() as { projects: Projects }
      setProject(data.projects)
    }
    fetchUrl()
  }, [projectId])

  const socket = useSocket({ wsUrl: project?.terminalUrl! })
  console.log(socket)
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
              <DynamicTerminalComponent socket={socket} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={35}>
          <Output url={project?.outputUrl!} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}


