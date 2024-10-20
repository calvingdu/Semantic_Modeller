import React, { useState, useMemo, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { List, Grid, ChevronLeft, ChevronRight, Filter, ArrowUpDown } from "lucide-react"
import GraphView from './GraphView'
import { useTheme } from 'next-themes'

const ITEMS_PER_PAGE = 5

const TOPIC_COLORS = [
  'var(--topic-color-1)',
  'var(--topic-color-2)',
  'var(--topic-color-3)',
  'var(--topic-color-4)',
  'var(--topic-color-5)',
]

export default function AnalysisResults({ topics, onTopicClick, files, onFileSelect, analysisResults, isLoading, error }) {
  const [view, setView] = useState('list')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageInput, setPageInput] = useState('1')
  const [filteredTopics, setFilteredTopics] = useState([])
  const [minScore, setMinScore] = useState(0)
  const [minScoreInput, setMinScoreInput] = useState('0')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('score')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedFile, setSelectedFile] = useState('all')
  const { theme } = useTheme()

  const filteredAndSortedResults = useMemo(() => {
    if (!analysisResults) return [];
  
    let results = analysisResults.flatMap(topicResult => 
      topicResult.similar_passages.map(passage => ({
        ...passage,
        topic: topicResult.topic
      }))
    );
  
    results = results.filter(passage => 
      (filteredTopics.length === 0 || filteredTopics.includes(passage.topic)) &&
      parseFloat(passage.score) >= parseFloat(minScoreInput) &&
      (selectedFile === 'all' || passage.document === selectedFile)
    );
  
    results.sort((a, b) => {
      if (sortBy === 'score') {
        return sortOrder === 'asc' ? a.score - b.score : b.score - a.score;
      } else if (sortBy === 'page') {
        return sortOrder === 'asc' ? a.page - b.page : b.page - a.page;
      } else {
        return sortOrder === 'asc' 
          ? a.document.localeCompare(b.document) 
          : b.document.localeCompare(a.document);
      }
    });
  
    return results;
  }, [analysisResults, filteredTopics, minScoreInput, selectedFile, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedResults.length / ITEMS_PER_PAGE)
  const currentResults = filteredAndSortedResults.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const getTopicColor = (topic) => {
    const index = topics.indexOf(topic)
    return index !== -1 ? TOPIC_COLORS[index % TOPIC_COLORS.length] : 'var(--topic-color-default)'
  }

  const handleResultClick = (result) => {
    onTopicClick(result.topic, result.document, result.page)
    onFileSelect(result.document)
  }

  const toggleTopicFilter = (topic) => {
    setFilteredTopics(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    )
  }

  const toggleSort = (sortKey) => {
    if (sortBy === sortKey) {
      setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(sortKey)
      setSortOrder('desc')
    }
  }

  const handleMinScoreChange = (e) => {
    setMinScoreInput(e.target.value)
  }

  const handleMinScoreSubmit = (e) => {
    e.preventDefault()
    const newScore = parseFloat(minScoreInput)
    if (!isNaN(newScore) && newScore >= 0 && newScore <= 1) {
      setMinScore(newScore)
    }
  }

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value)
  }

  const handlePageInputSubmit = (e) => {
    e.preventDefault()
    const newPage = parseInt(pageInput, 10)
    if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (error) {
    return <div className="text-center py-8 text-destructive">{error}</div>
  }

  if (isLoading) {
    return <div className="text-center py-8">Analyzing documents...</div>
  }

  if (!analysisResults || analysisResults.length === 0) {
    return <div className="text-center py-8">No analysis results available. Please upload files and start the analysis.</div>
  }

  return (
    <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md mt-4">
      <div className="flex justify-between mb-4">
        <h3 className="font-semibold">Analysis Results:</h3>
        <div className="flex space-x-2">
          <Button 
            variant={view === 'list' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setView('list')}
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-4 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Filter by File:</h4>
          <Select value={selectedFile} onValueChange={setSelectedFile}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a file" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Files</SelectItem>
              {files.map((file, index) => (
                <SelectItem key={index} value={file.name}>{file.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <h4 className="font-semibold mt-4 mb-2">Filter by Topics:</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {topics.map((topic, index) => (
              <Button
                key={index}
                variant={filteredTopics.includes(topic) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleTopicFilter(topic)}
                style={{
                  backgroundColor: filteredTopics.includes(topic) ? getTopicColor(topic) : 'var(--topic-unselected)',
                  color: filteredTopics.includes(topic) ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
              >
                {topic}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center mb-2">
            <h4 className="font-semibold mr-2">Minimum Score:</h4>
            <form onSubmit={handleMinScoreSubmit} className="flex-shrink-0">
              <Input
                type="text"
                value={minScoreInput}
                onChange={handleMinScoreChange}
                className="w-20"
              />
            </form>
          </div>
          <div className="flex items-center space-x-2">
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[minScore]}
              onValueChange={(value) => {
                setMinScore(value[0])
                setMinScoreInput(value[0].toFixed(2))
              }}
              className="w-full"
            />
          </div>
        </div>
      )}

      {view === 'list' ? (
        <>
          <div className="flex justify-end space-x-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort('document')}
            >
              Sort by File
              <ArrowUpDown className="h-4 w-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort('page')}
            >
              Sort by Page
              <ArrowUpDown className="h-4 w-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort('score')}
            >
              Sort by Score
              <ArrowUpDown className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <div className="border rounded-lg p-4 space-y-2 h-[800px] overflow-y-auto">
            {currentResults.length > 0 ? (
              currentResults.map((result, i) => (
                <div 
                  key={i} 
                  className="p-4 bg-muted rounded cursor-pointer hover:bg-accent"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded`} style={{backgroundColor: getTopicColor(result.topic)}}>
                      Topic: {result.topic}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      File: {result.document}, Page {result.page}
                    </span>
                  </div>
                  <p className="text-sm p-2 break-words">{result.text}</p>
                  <div className="text-right text-sm text-muted-foreground">
                    Score: {result.score.toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">No results match the current filters.</div>
            )}
          </div>
          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              size="sm"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-2">Page</span>
              <form onSubmit={handlePageInputSubmit} className="flex items-center">
                <Input
                  type="text"
                  value={pageInput}
                  onChange={handlePageInputChange}
                  className="w-16 text-center mr-2"
                />
                <span className="text-sm text-muted-foreground">of {totalPages}</span>
              </form>
            </div>
            <Button
              onClick={handleNextPage}
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