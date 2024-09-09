'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { List, Grid, ChevronLeft, ChevronRight } from "lucide-react"
import GraphView from './GraphView'

const ITEMS_PER_PAGE = 5

export default function AnalysisResults() {
  const [view, setView] = useState('list')
  const [currentPage, setCurrentPage] = useState(1)

  // Simulate a large number of references
  const references = Array.from({ length: 30 }, (_, i) => ({
    page: i + 1,
    text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ${i + 1}`,
    topic: `Example Topic ${(i % 5) + 1}`,
    score: (0.00).toFixed(2)
  }))

  const totalPages = Math.ceil(references.length / ITEMS_PER_PAGE)
  const currentReferences = references.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="bg-card p-4 rounded-lg shadow-md mt-4">
      <div className="flex justify-between mb-4">
        <h3 className="font-semibold">Analysis Results:</h3>
        <div>
          <Button 
            variant={view === 'list' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setView('list')}
            className="mr-2"
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button 
            variant={view === 'graph' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setView('graph')}
          >
            <Grid className="h-4 w-4 mr-2" />
            Graph
          </Button>
        </div>
      </div>
      {view === 'list' ? (
        <>
          <div className="border rounded-lg p-4">
            {currentReferences.map((ref, i) => (
              <div key={i} className="mb-3 last:mb-0 text-sm">
                <h4 className="text-xs font-semibold text-primary mb-1">Page {ref.page}:</h4>
                <p className="text-muted-foreground">{ref.text}</p>
                <p className="text-xs text-muted-foreground mt-1">Topic: {ref.topic} (Score: {ref.score})</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              size="sm"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              size="sm"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </>
      ) : (
        <GraphView />
      )}
    </div>
  )
}