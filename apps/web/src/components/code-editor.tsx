'use client'
import { File } from "@/utils/file.type";
import Editor from "@monaco-editor/react";
import { useRef, useState } from "react";
interface CodeProps {
  selectedFile: File
}
export const Code = ({ selectedFile }: CodeProps) => {

  if (!selectedFile) return null

  const [fileName, setFileName] = useState(selectedFile.path);

  const code = selectedFile.content
  let language = 'js'
  const contentRef = useRef<string>("")

  if (language === "js" || language === "jsx")
    language = "javascript";
  else if (language === "ts" || language === "tsx")
    language = "typescript"

  const files = ['script.js', 'style.css', 'index.html']

  return (
    <>
      {files.map(f => <button disabled={fileName === f} onClick={() => setFileName(f)} className={`bg-background px-5 py-2 ${fileName == f ? 'bg-[#1e1e1e] border-t border-blue-500' : 'bg-background'}`}>
        {f}
      </button>
      )}
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



