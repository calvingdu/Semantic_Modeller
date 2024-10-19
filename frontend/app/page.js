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

  const handleTopicClick = useCallback((topic, file, page) => {
    const fileIndex = files.findIndex(f => f.name === file);
    if (fileIndex !== -1) {
      setCurrentFileIndex(fileIndex);
      setCurrentPage(page);
    }
  }, [files, setCurrentFileIndex, setCurrentPage]);

  const handleFileSelect = useCallback((file) => {
    const fileIndex = files.findIndex(f => f.name === file);
    if (fileIndex !== -1) {
      setCurrentFileIndex(fileIndex);
    }
  }, [files, setCurrentFileIndex]);

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
          />
        </div>
        <div>
          <TopicManager 
            topics={topics} 
            setTopics={setTopics} 
          />
          <AnalysisResults 
            topics={topics}
            onTopicClick={handleTopicClick}
            files={files.map(file => file.name)}
            onFileSelect={handleFileSelect}
          />
        </div>
      </div>
    </div>
  )
}