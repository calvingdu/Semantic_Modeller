import React, { useState, useMemo, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { List, Grid, ChevronLeft, ChevronRight, Filter, ArrowUpDown } from "lucide-react"
import GraphView from './GraphView'
import { useTheme } from 'next-themes'

const ITEMS_PER_PAGE = 6

const TOPIC_COLORS = [
  'var(--topic-color-1)',
  'var(--topic-color-2)',
  'var(--topic-color-3)',
  'var(--topic-color-4)',
  'var(--topic-color-5)',
]

const truncateFileName = (fileName, maxLength) => {
  if (fileName.length <= maxLength) return fileName;
  const extension = fileName.split('.').pop();
  const nameWithoutExtension = fileName.slice(0, -(extension.length + 1));
  return `${nameWithoutExtension.slice(0, maxLength - 3 - extension.length)}...${extension}`;
};

export default function AnalysisResults({ topics, onTopicClick, files, onFileSelect, analysisResults, isLoading, error }) {
  const [view, setView] = useState('list')
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredTopics, setFilteredTopics] = useState([])
  const [minScore, setMinScore] = useState(0)
  const [minScoreInput, setMinScoreInput] = useState('0')
  const [showFilters, setShowFilters] = useState(false)
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
        return b.score - a.score
    });
  
    return results;
  }, [analysisResults, filteredTopics, minScoreInput, selectedFile]);

  const totalPages = Math.ceil(filteredAndSortedResults.length / ITEMS_PER_PAGE)
  const currentResults = filteredAndSortedResults.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTopics, minScore, selectedFile]);

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
    <div className="bg-card text-card-foreground p-4 rounded-lg shadow-md mt-4 max-h-[80vh] flex flex-col">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h3 className="font-semibold mb-2 md:mb-0">Analysis Results:</h3>
        <div className="flex flex-wrap gap-2">
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
              {files.map((fileName, index) => (
                <SelectItem key={index} value={fileName}>{fileName}</SelectItem>
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
        <div className="flex-grow overflow-y-auto">
          {currentResults.length > 0 ? (
            currentResults.map((result, i) => (
              <div 
                key={i} 
                className="border-b last:border-b-0 cursor-pointer hover:bg-accent"
                onClick={() => handleResultClick(result)}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded mb-2 sm:mb-0`} style={{backgroundColor: getTopicColor(result.topic)}}>
                    {result.topic}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {truncateFileName(result.document, 30)}, Page {result.page}
                  </span>
                </div>
                <p className="text-sm p-2 break-words">{result.text}</p>
                <div className="text-right text-xs text-muted-foreground p-2">
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
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-2">Page</span>
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="w-16 text-center mx-2"
              />
              <span className="text-sm text-muted-foreground">of {totalPages}</span>
            </div>
            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              size="sm"
              variant="outline"
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