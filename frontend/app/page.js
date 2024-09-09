'use client'

import React, { useState, useCallback } from 'react'
import FileUpload from '../components/FileUpload'
import TopicManager from '../components/TopicManager'
import AnalysisResults from '../components/AnalysisResults'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import TitleAnimation from '@/components/TitleAnimation'

export default function Home() {
  const [files, setFiles] = useState([])
  const [topics, setTopics] = useState([])
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [highlights, setHighlights] = useState([])

  const handleTopicClick = useCallback((topic) => {
    const highlight = highlights.find(h => h.text.toLowerCase() === topic.toLowerCase());
    if (highlight) {
      setCurrentPage(highlight.page);
      // You might want to add logic here to scroll to the specific highlight on the page
    }
  }, [highlights, setCurrentPage]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-end mb-4">
        <ThemeSwitcher />
      </div>
      <TitleAnimation />
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <FileUpload
            files={files}
            setFiles={setFiles}
            currentFileIndex={currentFileIndex}
            setCurrentFileIndex={setCurrentFileIndex}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            topics={topics}
            setHighlights={setHighlights}
          />
        </div>
        <div>
          <TopicManager 
            topics={topics} 
            setTopics={setTopics} 
            onTopicClick={handleTopicClick}
          />
          <AnalysisResults />
        </div>
      </div>
    </div>
  )
}