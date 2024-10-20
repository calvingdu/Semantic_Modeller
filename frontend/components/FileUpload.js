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

export default function FileUpload({ files, setFiles, currentFileIndex, setCurrentFileIndex, currentPage, setCurrentPage, onFilesReady }) {
  const [numPages, setNumPages] = useState(null)
  const [error, setError] = useState(null)
  const [currentArrayBuffer, setCurrentArrayBuffer] = useState(null)
  const [scale, setScale] = useState(0.7)

  const loadFileArrayBuffer = useCallback(async (file) => {
    if (!file) {
      console.error('No file provided to loadFileArrayBuffer')
      setError('No file selected. Please try again.')
      return null
    }

    try {
      console.log('Loading file:', file.name || 'Unnamed file')
      
      const arrayBuffer = await file.arrayBuffer()

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
    console.log('onDrop called with', acceptedFiles.length, 'files');
    
    try {
      if (files.length + acceptedFiles.length > MAX_FILES) {
        setError(`You can only upload a maximum of ${MAX_FILES} files. Please remove some files before adding more.`);
        return;
      }
      
      const validFiles = acceptedFiles.filter(file => file.size <= MAX_FILE_SIZE);
      if (validFiles.length < acceptedFiles.length) {
        setError(`Some files were not added because they exceed the 10MB size limit.`);
      }
      
      const newFiles = await Promise.all(validFiles.map(async (file) => ({
        file,
        name: file.name, 
        pages: await getPageCount(file),
      })));
  
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      
      onFilesReady(updatedFiles);
      
    } catch (error) {
      console.error('Error in onDrop:', error);
      setError(`Failed to process uploaded files: ${error.message}. Please try again.`);
    }
  }, [files, setFiles, getPageCount, onFilesReady]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: MAX_FILES,
    maxSize: MAX_FILE_SIZE,
    multiple: true
  })

  return (
    <div className="bg-background text-foreground">
      <div className="bg-card rounded-lg shadow-md p-4">
        <div {...getRootProps()} className="border-2 border-dashed border-muted rounded-lg p-8 text-center cursor-pointer mb-4">
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
          {isDragActive
            ? "Drop the PDF files here"
            : (
              <>
                <span>Upload your PDF files (max 3 files, 10MB each).</span>
                <br />
                <span>We'll automatically scan, convert, and embed the pages for search.</span>
              </>
            )}
          </p>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {files.length > 0 && currentArrayBuffer && (
          <div className="mb-4">
            <PDFViewer
              currentArrayBuffer={currentArrayBuffer}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              scale={scale}
              numPages={numPages}
              setNumPages={setNumPages}
              setError={setError}
            />
            <ZoomControls
              scale={scale}
              setScale={setScale}
            />
          </div>
        )}
        {files.length > 0 && (
          <FileList
            files={files}
            currentFileIndex={currentFileIndex}
            setCurrentFileIndex={setCurrentFileIndex}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>
    </div>
  )
}