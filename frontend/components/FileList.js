import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { X, Trash2 } from "lucide-react"

export default function FileList({ files, currentFileIndex, setCurrentFileIndex, setCurrentPage, onRemoveFiles }) {
  const [selectedFiles, setSelectedFiles] = useState(new Array(files.length).fill(false))

  const toggleFileSelection = (index) => {
    setSelectedFiles(prev => {
      const newSelected = [...prev]
      newSelected[index] = !newSelected[index]
      return newSelected
    })
  }

  const handleRemoveSelected = () => {
    const indexesToRemove = selectedFiles.reduce((acc, isSelected, index) => {
      if (isSelected) acc.push(index)
      return acc
    }, [])
    onRemoveFiles(indexesToRemove)
    setSelectedFiles(new Array(files.length - indexesToRemove.length).fill(false))
  }

  const handleRemoveAll = () => {
    onRemoveFiles(files.map((_, index) => index))
    setSelectedFiles([])
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Uploaded Files:</h3>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveAll}
            disabled={files.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove All
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {files.map((fileObj, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className={`flex-grow justify-between ${index === currentFileIndex ? 'bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700' : ''}`}
              onClick={() => {
                setCurrentFileIndex(index)
                setCurrentPage(1)
              }}
            >
              <span>{fileObj.file.name} ({fileObj.pages} pages)</span>
              <X
                className="h-4 w-4 ml-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveFiles([index])
                }}
              />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}