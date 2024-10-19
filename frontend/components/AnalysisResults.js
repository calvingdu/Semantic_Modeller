import React, { useState, useEffect, useMemo } from 'react'
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

export default function AnalysisResults({ topics, onTopicClick, files, onFileSelect }) {
  console.log("AnalysisResults props:", { topics, files });
  const [view, setView] = useState('list')
  const [currentPage, setCurrentPage] = useState(1)
  const [analysisResults, setAnalysisResults] = useState([])
  const [filteredTopics, setFilteredTopics] = useState([])
  const [minScore, setMinScore] = useState(0)
  const [minScoreInput, setMinScoreInput] = useState('0')
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('score')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedFile, setSelectedFile] = useState('all')
  const { theme } = useTheme()

  useEffect(() => {
    console.log("Files in useEffect:", files);
    const fetchAnalysisResults = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Simulate analysis results
        const simulatedResults = files.flatMap(file => 
          Array.from({ length: 5 }, (_, i) => ({
            file: file,
            page: i + 1,
            text: `Sample text from ${file}, page ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
            topic: `Example Topic ${(i % 5) + 1}`,
            score: Math.random().toFixed(2)
          }))
        );
        
        setAnalysisResults(simulatedResults)
      } catch (err) {
        console.error("Error fetching analysis results:", err)
        setError('Failed to fetch analysis results. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalysisResults()
  }, [files])

  const filteredAndSortedResults = useMemo(() => {
    let results = analysisResults.filter(result => 
      (filteredTopics.length === 0 || filteredTopics.includes(result.topic)) &&
      parseFloat(result.score) >= minScore &&
      (selectedFile === 'all' || result.file === selectedFile)
    )

    results.sort((a, b) => {
      if (sortBy === 'score') {
        return sortOrder === 'asc' ? parseFloat(a.score) - parseFloat(b.score) : parseFloat(b.score) - parseFloat(a.score)
      } else if (sortBy === 'page') {
        return sortOrder === 'asc' ? a.page - b.page : b.page - a.page
      } else {
        // Safely handle potential undefined files
        const fileA = a.file || ''
        const fileB = b.file || ''
        return sortOrder === 'asc' 
          ? fileA.localeCompare(fileB) 
          : fileB.localeCompare(fileA)
      }
    })

    return results
  }, [analysisResults, filteredTopics, minScore, selectedFile, sortBy, sortOrder])

  const totalPages = Math.ceil(filteredAndSortedResults.length / ITEMS_PER_PAGE)
  const currentResults = filteredAndSortedResults.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const getTopicColor = (topic) => {
    const index = topics.indexOf(topic)
    return index !== -1 ? TOPIC_COLORS[index % TOPIC_COLORS.length] : 'var(--topic-color-default)'
  }

  const handleResultClick = (result) => {
    onTopicClick(result.topic, result.file, result.page)
    onFileSelect(result.file)
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

  if (isLoading) {
    return <div className="text-center py-8">Loading analysis results...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">{error}</div>
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
                <SelectItem key={index} value={file}>{file}</SelectItem>
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
            <h4 className="font-semibold">Minimum Score:</h4>
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
              onClick={() => toggleSort('file')}
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
          <div className="border rounded-lg p-4 space-y-2">
            {currentResults.map((ref, i) => (
              <div 
                key={i} 
                className="p-4 bg-muted rounded cursor-pointer hover:bg-accent"
                onClick={() => handleResultClick(ref)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded`} style={{backgroundColor: getTopicColor(ref.topic)}}>
                    Topic: {ref.topic}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    File: {ref.file}, Page {ref.page}
                  </span>
                </div>
                <p className="text-sm p-2">{ref.text}</p>
                <div className="text-right text-sm text-muted-foreground">
                  Score: {ref.score}
                </div>
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