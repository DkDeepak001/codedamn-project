'use client'
import Editor from "@monaco-editor/react";
import { useRef, useState } from "react";
import _ from 'lodash';
import FileItemWithFileIcon from "@sinm/react-file-tree/lib/FileItemWithFileIcon";
import { X } from "lucide-react";

interface CodeProps {
  selectedFile: string
  recentFiles: string[]
  setSelectedFile: (filePath: string) => void
  removeFromRecent: (filePath: string) => void

}
export const Code = ({ selectedFile, recentFiles, setSelectedFile, removeFromRecent }: CodeProps) => {

  if (!selectedFile) return null


  const code = 'asdasdasd'
  let language = 'js'
  const contentRef = useRef<string>("")

  if (language === "js" || language === "jsx")
    language = "javascript";
  else if (language === "ts" || language === "tsx")
    language = "typescript"


  // {_.last(_.split(f, '/'))!}
  return (
    <>
      <div className="flex flex-row overflow-y-auto ">
        {recentFiles.map(f => <button
          disabled={selectedFile === f}
          onClick={() => setSelectedFile(f)}
          className={`bg-background px-5 py-2 flex flex-row gap-x-1 
          ${selectedFile == f ? 'bg-[#1e1e1e] border-t border-blue-500' : 'bg-background'}`}>
          <FileItemWithFileIcon treeNode={{
            type: 'file', uri: f
          }} />
          <X className="cursor-pointer" onClick={() => removeFromRecent(f)} />
        </button>
        )}
      </div>
      <Editor
        language={language}
        value={code}
        theme="vs-dark"
        loading={<div className="text-white">Fetching content...</div>}
        onChange={(text) => contentRef.current = text ?? ""}
        defaultLanguage="txt"
        saveViewState
      />
    </>

  )
}



