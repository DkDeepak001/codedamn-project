import Editor from "@monaco-editor/react";
import { useRef } from "react";
import _ from 'lodash';
import FileItemWithFileIcon from "@sinm/react-file-tree/lib/FileItemWithFileIcon";
import { X } from "lucide-react";
import { SelectedFileType } from "@/app/playground/page";
import { getLanguage } from "@/libs/getLanguage";

interface CodeProps {
  selectedFile: SelectedFileType
  recentFiles: SelectedFileType[]
  setSelectedFile: (file: SelectedFileType) => void
  removeFromRecent: (file: SelectedFileType) => void

}
export const Code = ({ selectedFile, recentFiles, setSelectedFile, removeFromRecent }: CodeProps) => {

  if (!selectedFile) return null

  const code = selectedFile.content
  let language = getLanguage(selectedFile.uri)
  const contentRef = useRef<string>("")

  return (
    <>
      <div className="flex flex-row overflow-y-auto ">
        {recentFiles.map(f => <button
          className={`bg-background px-5 py-2 flex flex-row gap-x-1 
          ${selectedFile.uri == f.uri ? 'bg-[#1e1e1e] border-t border-blue-500' : 'bg-background'}`}>
          <div onClick={() => setSelectedFile(f)}>
            <FileItemWithFileIcon treeNode={{
              type: 'file', uri: f.uri
            }} />
          </div>
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
        saveViewState
      />
    </>

  )
}



