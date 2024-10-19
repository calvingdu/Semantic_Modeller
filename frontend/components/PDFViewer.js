import React, { useCallback, useRef } from 'react'
import { Document, Page } from 'react-pdf'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight } from "lucide-react"

const STANDARD_WIDTH = 800;

export default function PDFViewer({ currentArrayBuffer, currentPage, setCurrentPage, scale, numPages, setNumPages, setError }) {
  const containerRef = useRef(null)

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    console.log('Document loaded successfully. Number of pages:', numPages)
    setNumPages(numPages)
    setCurrentPage(1)
    setError(null)
  }, [setCurrentPage, setNumPages, setError])

  const onDocumentLoadError = useCallback((error) => {
    console.error('Error loading document:', error)
    setError(`Failed to load PDF: ${error.message}. Please try uploading the file again.`)
  }, [setError])

  const nextPage = useCallback(() => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, numPages))
  }, [numPages, setCurrentPage])

  const prevPage = useCallback(() => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1))
  }, [setCurrentPage])

  const goToPage = useCallback((e) => {
    const page = parseInt(e.target.value)
    if (page >= 1 && page <= numPages) {
      setCurrentPage(page)
    }
  }, [numPages, setCurrentPage])

  return (
    <>
      <div ref={containerRef} className="overflow-auto" style={{ height: '70vh', width: '100%' }}>
        <Document
          file={currentArrayBuffer}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          error={<div>Failed to load PDF. Please check the console for more details.</div>}
        >
          <Page
            pageNumber={currentPage}
            width={STANDARD_WIDTH * scale}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
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
    </>
  )
}