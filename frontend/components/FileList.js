import React from 'react'
import { Button } from "@/components/ui/button"

export default function FileList({ files, currentFileIndex, setCurrentFileIndex, setCurrentPage }) {
  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Uploaded Files:</h3>
      <div className="flex flex-wrap gap-2">
        {files.map((fileObj, index) => (
          <Button
            key={index}
            variant={index === currentFileIndex ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setCurrentFileIndex(index)
              setCurrentPage(1)
            }}
          >
            {fileObj.file.name} ({fileObj.pages} pages)
          </Button>
        ))}
      </div>
    </div>
  )
}