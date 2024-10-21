'use client'

import React, { useState, useCallback, useEffect } from 'react'
import FileUpload from '../components/FileUpload'
import TopicManager from '../components/TopicManager'
import AnalysisResults from '../components/AnalysisResults'
import AnalysisController from '../components/AnalysisController'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import TitleAnimation from '@/components/TitleAnimation'

export default function Home() {
  const [files, setFiles] = useState([])
  const [topics, setTopics] = useState([])
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [minScore, setMinScore] = useState(0)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)
  const [generateTopics, setGenerateTopics] = useState(true)
  const [topicColors, setTopicColors] = useState({})

  useEffect(() => {
    const colors = {};
    topics.forEach((topic, index) => {
      colors[topic] = `var(--topic-color-${(index % 5) + 1})`;
    });
    setTopicColors(colors);
  }, [topics]);

  const handleTopicClick = useCallback((topic, file, page) => {
    const fileIndex = files.findIndex(f => f.file.name === file);
    if (fileIndex !== -1) {
      setCurrentFileIndex(fileIndex);
      setCurrentPage(parseInt(page));
    }
  }, [files]);

  const handleFileSelect = useCallback((file) => {
    const fileIndex = files.findIndex(f => f.file.name === file);
    if (fileIndex !== -1) {
      setCurrentFileIndex(fileIndex);
    }
  }, [files]);

  const handleRemoveFiles = useCallback((removedFileNames) => {
    setFiles(prevFiles => prevFiles.filter(file => !removedFileNames.includes(file.file.name)))
    
    if (analysisResults) {
      setAnalysisResults(prevResults => 
        prevResults.map(topicResult => ({
          ...topicResult,
          similar_passages: topicResult.similar_passages.filter(
            passage => !removedFileNames.includes(passage.document)
          )
        })).filter(topicResult => topicResult.similar_passages.length > 0)
      )
    }

    // Adjust currentFileIndex if necessary
    setCurrentFileIndex(prevIndex => {
      if (prevIndex >= files.length - removedFileNames.length) {
        return Math.max(0, files.length - removedFileNames.length - 1);
      }
      return prevIndex;
    })

    setCurrentPage(1)
  }, [files, analysisResults])

  const handleAnalysisComplete = useCallback((results) => {
    setAnalysisResults(results);
    setAnalysisError(null);
    setIsAnalyzing(false);
  }, []);

  const handleAnalysisError = useCallback((error) => {
    setAnalysisError(error);
    setIsAnalyzing(false);
  }, []);

  const handleGenerateTopicsChange = useCallback((value) => {
    setGenerateTopics(value);
  }, []);

  const handleTopicsGenerated = useCallback((generatedTopics) => {
    setTopics(prevTopics => {
      const newTopics = [...new Set([...prevTopics, ...generatedTopics])];
      console.log('Updated topics:', newTopics);
      return newTopics;
    });
  }, []);


  return (
    <div className="container mx-auto px-1 py-8">
      <div className="flex justify-end mb-4">
        <ThemeSwitcher />
      </div>
      <TitleAnimation />
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <FileUpload
            files={files}
            setFiles={setFiles}
            currentFileIndex={currentFileIndex}
            setCurrentFileIndex={setCurrentFileIndex}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            analysisResults={analysisResults}
            topics={topics}
            onRemoveFiles={handleRemoveFiles}
          />
        </div>
        <div>
          <TopicManager 
            topics={topics} 
            setTopics={setTopics} 
            onGenerateTopicsChange={handleGenerateTopicsChange}
            generateTopics={generateTopics}
          />
          <AnalysisController
            files={files}
            topics={topics}
            minScore={minScore}
            generateTopics={generateTopics}
            onAnalysisComplete={handleAnalysisComplete}
            onAnalysisError={handleAnalysisError}
            onTopicsGenerated={handleTopicsGenerated}
            onGenerateTopicsChange={handleGenerateTopicsChange}
          />
          <AnalysisResults 
            topics={topics}
            onTopicClick={handleTopicClick}
            files={files.map(file => file.file.name)}
            onFileSelect={handleFileSelect}
            analysisResults={analysisResults}
            minScore={minScore}
            error={analysisError}
            isLoading={isAnalyzing}
          />
        </div>
      </div>
    </div>
  )
}