'use client'

import React, { useCallback, useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react"
import { useDropzone } from 'react-dropzone'
import { getDocument } from '@/lib/pdfjs-loader'
import { Document, Page, pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

const MAX_FILES = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const STANDARD_WIDTH = 800; // Standard width for PDF display

export default function FileUpload({ files, setFiles, currentFileIndex, setCurrentFileIndex, currentPage, setCurrentPage }) {
  const [numPages, setNumPages] = useState(null)
  const [pageWidth, setPageWidth] = useState(STANDARD_WIDTH)
  const [error, setError] = useState(null)
  const [currentArrayBuffer, setCurrentArrayBuffer] = useState(null)
  const [scale, setScale] = useState(1)
  const containerRef = useRef(null)

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

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    console.log('Document loaded successfully. Number of pages:', numPages)
    setNumPages(numPages)
    setCurrentPage(1)
    setError(null)
  }, [setCurrentPage])

  const onDocumentLoadError = useCallback((error) => {
    console.error('Error loading document:', error)
    setError(`Failed to load PDF: ${error.message}. Please try uploading the file again.`)
  }, [])

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

  const nextPage = useCallback(() => {
    setCurrentPage(prevPage => {
      const nextPage = prevPage < numPages ? prevPage + 1 : prevPage
      console.log('Moving to next page:', nextPage)
      return nextPage
    })
  }, [numPages, setCurrentPage])

  const prevPage = useCallback(() => {
    setCurrentPage(prevPage => {
      const previousPage = prevPage > 1 ? prevPage - 1 : prevPage
      console.log('Moving to previous page:', previousPage)
      return previousPage
    })
  }, [setCurrentPage])

  const selectFile = useCallback((index) => {
    console.log('Selecting file at index:', index)
    setCurrentFileIndex(index)
    setCurrentPage(1)
  }, [setCurrentFileIndex, setCurrentPage])

  const removeFile = useCallback((index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
    if (currentFileIndex >= files.length - 1) {
      setCurrentFileIndex(Math.max(files.length - 2, 0))
    }
  }, [currentFileIndex, files.length, setCurrentFileIndex, setFiles])

  const goToPage = useCallback((e) => {
    const page = parseInt(e.target.value)
    if (page >= 1 && page <= numPages) {
      console.log('Going to page:', page)
      setCurrentPage(page)
    }
  }, [numPages, setCurrentPage])

  const onPageLoadSuccess = useCallback(() => {
    setPageWidth(STANDARD_WIDTH)
  }, [])

  const zoomIn = useCallback(() => {
    setScale(prevScale => Math.min(prevScale + 0.1, 2))
  }, [])

  const zoomOut = useCallback(() => {
    setScale(prevScale => Math.max(prevScale - 0.1, 0.5))
  }, [])

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
            <div ref={containerRef} className="overflow-auto" style={{ height: '70vh', width: '100%' }}>
              <Document
                file={currentArrayBuffer}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                error={<div>Failed to load PDF. Please check the console for more details.</div>}
              >
                <Page
                  pageNumber={currentPage}
                  width={pageWidth * scale}
                  onLoadSuccess={onPageLoadSuccess}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  scale={scale}
                />
              </Document>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {numPages}
              </span>
              <div className="flex items-center">
                <Button onClick={prevPage} disabled={currentPage <= 1} size="sm" variant="outline" className="mr-2">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Input 
                  type="number"
                  min={1}
                  max={numPages}
                  value={currentPage}
                  onChange={goToPage}
                  className="w-16 mx-2"
                />
                <Button onClick={nextPage} disabled={currentPage >= numPages} size="sm" variant="outline" className="ml-2">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-center mt-2">
              <Button onClick={zoomOut} size="sm" variant="outline" className="mr-2">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground mx-2">
                {Math.round(scale * 100)}%
              </span>
              <Button onClick={zoomIn} size="sm" variant="outline" className="ml-2">
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        {files.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Uploaded Files:</h3>
            <div className="flex flex-wrap gap-2">
              {files.map((fileObj, index) => (
                <div key={index} className="flex items-center bg-muted rounded p-2">
                  <Button
                    variant={index === currentFileIndex ? "default" : "outline"}
                    size="sm"
                    className="mr-2"
                    onClick={() => selectFile(index)}
                  >
                    {fileObj.file.name} ({fileObj.pages} pages)
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