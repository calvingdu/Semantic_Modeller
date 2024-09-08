'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, ChevronLeft, ChevronRight, X } from "lucide-react"
import { useDropzone } from 'react-dropzone'
import * as pdfjs from '@/lib/pdfjs-loader'

export default function FileUpload({ files, setFiles, currentFileIndex, setCurrentFileIndex, currentPage, setCurrentPage }) {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [error, setError] = useState(null)

  const getPageCount = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
      return pdf.numPages
    } catch (error) {
      console.error('Error getting page count:', error)
      setError('Failed to process PDF. Please try again.')
      return 0
    }
  }

  const onDrop = useCallback(async (acceptedFiles) => {
    try {
      const newFiles = await Promise.all(acceptedFiles.map(async file => ({
        ...file,
        preview: URL.createObjectURL(file),
        pages: await getPageCount(file)
      })))
      setFiles(prevFiles => [...prevFiles, ...newFiles])
      if (newFiles.length > 0) {
        setCurrentFileIndex(files.length)
        setCurrentPage(1)
        setPreviewUrl(newFiles[0].preview)
        setTotalPages(newFiles[0].pages)
      }
    } catch (error) {
      console.error('Error processing dropped files:', error)
      setError('Failed to process uploaded files. Please try again.')
    }
  }, [files.length, setFiles, setCurrentFileIndex, setCurrentPage])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] }
  })

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const selectFile = (index) => {
    setCurrentFileIndex(index)
    setCurrentPage(1)
    setPreviewUrl(files[index].preview)
    setTotalPages(files[index].pages)
  }

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    if (currentFileIndex >= newFiles.length) {
      setCurrentFileIndex(newFiles.length - 1)
    }
    if (newFiles.length === 0) {
      setPreviewUrl(null)
      setTotalPages(0)
    } else {
      setPreviewUrl(newFiles[currentFileIndex]?.preview)
      setTotalPages(newFiles[currentFileIndex]?.pages)
    }
  }

  const goToPage = (pageNumber) => {
    const page = parseInt(pageNumber)
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  useEffect(() => {
    if (files[currentFileIndex]) {
      setPreviewUrl(files[currentFileIndex].preview)
      setTotalPages(files[currentFileIndex].pages)
    }
  }, [currentFileIndex, files])

  return (
    <div className="bg-background text-foreground">
      <div className="mb-4 text-center">
        <p className="text-muted-foreground">Upload your PDF files. We'll automatically scan, convert, and embed the pages for search.</p>
      </div>
      <div className="bg-card rounded-lg shadow-md p-4">
        <div {...getRootProps()} className="border-2 border-dashed border-muted rounded-lg p-8 text-center cursor-pointer mb-4">
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            {isDragActive ? "Drop the PDFs here" : "Drag and drop your PDFs here, or click to select files"}
          </p>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {previewUrl && (
          <div className="mb-4">
            <iframe src={`${previewUrl}#page=${currentPage}`} className="w-full h-96 border rounded" title="PDF Preview" />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center">
                <Button onClick={prevPage} disabled={currentPage === 1} size="sm" variant="outline" className="mr-2">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Input 
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => goToPage(e.target.value)}
                  className="w-16 mx-2"
                />
                <Button onClick={nextPage} disabled={currentPage === totalPages} size="sm" variant="outline" className="ml-2">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
        {files.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Uploaded Files:</h3>
            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center bg-muted rounded p-2">
                  <Button
                    variant={index === currentFileIndex ? "default" : "outline"}
                    size="sm"
                    className="mr-2"
                    onClick={() => selectFile(index)}
                  >
                    {file.name} ({file.pages} pages)
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => removeFile(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}