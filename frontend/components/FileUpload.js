'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { Upload } from "lucide-react"
import { useDropzone } from 'react-dropzone'
import { getDocument } from '@/lib/pdfjs-loader'
import PDFViewer from './PDFViewer'
import ZoomControls from './ui/ZoomControls'
import FileList from './FileList'

const MAX_FILES = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export default function FileUpload({ 
  files, 
  setFiles, 
  currentFileIndex, 
  setCurrentFileIndex, 
  currentPage, 
  setCurrentPage,
  analysisResults,
  topics,
  onRemoveFiles
}) {
  const [numPages, setNumPages] = useState(null)
  const [error, setError] = useState(null)
  const [currentArrayBuffer, setCurrentArrayBuffer] = useState(null)
  const [scale, setScale] = useState(0.88)

  const loadFileArrayBuffer = useCallback(async (file) => {
    if (!file) {
      console.error('No file provided to loadFileArrayBuffer')
      setError('No file selected. Please try again.')
      return null
    }

    try {
      console.log('Loading file:', file.name || 'Unnamed file')
      
      const arrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsArrayBuffer(file)
      })

      console.log('File loaded successfully')
      return arrayBuffer
    } catch (error) {
      console.error('Error loading file:', error)
      setError(`Failed to load file: ${error.message}. Please try again.`)
      return null
    }
  }, [])

  useEffect(() => {
    const loadCurrentFile = async () => {
      console.log('Current file index:', currentFileIndex)
      const currentFile = files[currentFileIndex]
      if (currentFile) {
        const arrayBuffer = await loadFileArrayBuffer(currentFile.file)
        if (arrayBuffer) {
          setCurrentArrayBuffer(arrayBuffer)
          setError(null)
        }
      } else {
        console.log('No file at index:', currentFileIndex)
        setCurrentArrayBuffer(null)
      }
    }

    loadCurrentFile()
  }, [currentFileIndex, files, loadFileArrayBuffer])

  const getPageCount = useCallback(async (file) => {
    try {
      console.log('Getting page count for file:', file.name || 'Unnamed file')
      const arrayBuffer = await loadFileArrayBuffer(file)
      if (!arrayBuffer) {
        throw new Error('Failed to load file')
      }
      const pdf = await getDocument({ data: arrayBuffer }).promise
      console.log('Page count:', pdf.numPages)
      return pdf.numPages
    } catch (error) {
      console.error('Error getting page count:', error)
      setError(`Failed to process PDF: ${error.message}. Please try again.`)
      return 0
    }
  }, [loadFileArrayBuffer])

  const onDrop = useCallback(async (acceptedFiles) => {
    try {
      console.log('Files dropped:', acceptedFiles.map(f => f.name || 'Unnamed file'))
      if (files.length + acceptedFiles.length > MAX_FILES) {
        setError(`You can only upload a maximum of ${MAX_FILES} files. Please remove some files before adding more.`)
        return
      }
      
      const validFiles = acceptedFiles.filter(file => file.size <= MAX_FILE_SIZE)
      if (validFiles.length < acceptedFiles.length) {
        setError(`Some files were not added because they exceed the 10MB size limit.`)
      }
      
      const newFiles = await Promise.all(validFiles.map(async file => ({
        file,
        pages: await getPageCount(file)
      })))
      setFiles(prevFiles => [...prevFiles, ...newFiles])
      if (newFiles.length > 0) {
        setCurrentFileIndex(files.length)
        setCurrentPage(1)
      }
    } catch (error) {
      console.error('Error processing dropped files:', error)
      setError(`Failed to process uploaded files: ${error.message}. Please try again.`)
    }
  }, [files, setFiles, setCurrentFileIndex, setCurrentPage, getPageCount])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: MAX_FILES,
    maxSize: MAX_FILE_SIZE,
    multiple: true
  })

  const handleRemoveFiles = useCallback((indexesToRemove) => {
    const newFiles = files.filter((_, index) => !indexesToRemove.includes(index));
    setFiles(newFiles);
    
    const removedFileNames = indexesToRemove.map(index => files[index].file.name);
    onRemoveFiles(removedFileNames);
    
    if (newFiles.length === 0) {
      setCurrentFileIndex(-1);
      setCurrentPage(1);
      setCurrentArrayBuffer(null);
    } else if (indexesToRemove.includes(currentFileIndex)) {
      setCurrentFileIndex(0);
      setCurrentPage(1);
    }
  }, [files, setFiles, onRemoveFiles, currentFileIndex, setCurrentFileIndex, setCurrentPage]);

  return (
    <div className="bg-background text-foreground h-full flex flex-col">
      <div className="bg-card rounded-lg shadow-md p-4 flex-grow flex flex-col">
        <div {...getRootProps()} className="border-2 border-dashed border-muted rounded-lg p-2 text-center cursor-pointer mb-2" style={{ height: '60px' }}>
          <input {...getInputProps()} />
          <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
          <p className="text-xs text-muted-foreground">
            {isDragActive
              ? "Drop the PDF files here"
              : "Upload your PDF files (max 3 files, 10MB each)"}
          </p>
        </div>
        {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
        <div className="flex-grow overflow-hidden mb-2">
          {files.length > 0 && currentArrayBuffer ? (
            <PDFViewer
              currentArrayBuffer={currentArrayBuffer}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              scale={scale}
              numPages={numPages}
              setNumPages={setNumPages}
              setError={setError}
              analysisResults={analysisResults}
              topics={topics}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Upload a PDF to view it here
            </div>
          )}
        </div>
        <ZoomControls
          scale={scale}
          setScale={setScale}
        />
      </div>
      <div className="mt-2">
        <FileList
          files={files}
          currentFileIndex={currentFileIndex}
          setCurrentFileIndex={setCurrentFileIndex}
          setCurrentPage={setCurrentPage}
          onRemoveFiles={handleRemoveFiles}
        />
      </div>
    </div>
  )
}