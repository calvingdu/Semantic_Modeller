import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

const STANDARD_WIDTH = 1000;

const TOPIC_COLORS = [
  'var(--topic-color-1)',
  'var(--topic-color-2)',
  'var(--topic-color-3)',
  'var(--topic-color-4)',
  'var(--topic-color-5)',
];

export default function PDFViewer({ 
  currentArrayBuffer, 
  currentPage, 
  setCurrentPage, 
  scale, 
  numPages, 
  setNumPages, 
  setError,
  analysisResults,
  topics
}) {
  const containerRef = useRef(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  const getTopicColor = useCallback((topic) => {
    const index = topics.indexOf(topic);
    return index !== -1 ? TOPIC_COLORS[index % TOPIC_COLORS.length] : 'var(--topic-color-default)';
  }, [topics]);

  useEffect(() => {
    if (currentArrayBuffer) {
      const blob = new Blob([currentArrayBuffer], { type: 'application/pdf' });
      setPdfFile(blob);
    }
  }, [currentArrayBuffer]);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    console.log('Document loaded successfully. Number of pages:', numPages);
    setNumPages(numPages);
    setCurrentPage(1);
    setError(null);
  }, [setCurrentPage, setNumPages, setError]);

  const onDocumentLoadError = useCallback((error) => {
    console.error('Error loading document:', error);
    setError(`Failed to load PDF: ${error.message}. Please try uploading the file again.`);
  }, [setError]);

  const nextPage = useCallback(() => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, numPages));
  }, [numPages, setCurrentPage]);

  const prevPage = useCallback(() => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  }, [setCurrentPage]);

  const goToPage = useCallback((e) => {
    const page = parseInt(e.target.value);
    if (page >= 1 && page <= numPages) {
      setCurrentPage(page);
    }
  }, [numPages, setCurrentPage]);

  const customTextRenderer = useCallback(({ str, itemIndex }) => {
    if (!analysisResults || !Array.isArray(analysisResults)) {
      return str;
    }

    const highlightedPassages = analysisResults.flatMap(result => {
      if (result && result.similar_passages && Array.isArray(result.similar_passages)) {
        return result.similar_passages.filter(passage => 
          passage && passage.page && passage.page === currentPage
        );
      }
      return [];
    });

    let highlighted = false;
    let highlightColor = '';

    for (const passage of highlightedPassages) {
      if (passage && passage.text && str.includes(passage.text)) {
        highlighted = true;
        highlightColor = getTopicColor(passage.topic);
        break;
      }
    }

    if (highlighted) {
      return `<mark style="background-color: ${highlightColor}; color: black;">${str}</mark>`;
    }

    return str;
  }, [analysisResults, currentPage, getTopicColor]);

  if (!pdfFile) {
    return <div>Loading PDF...</div>;
  }

  return (
    <>
      <div ref={containerRef} className="overflow-auto" style={{ width: '100%' }}>
        <Document
          file={pdfFile}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          error={<div>Failed to load PDF. Please check the console for more details.</div>}
        >
          <Page
            pageNumber={currentPage}
            width={STANDARD_WIDTH * scale}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={false}
            customTextRenderer={customTextRenderer}
          />
        </Document>
      </div>
      <div>{debugInfo}</div>
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
  );
}