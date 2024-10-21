'use client'

import React, { useState, useCallback, useEffect } from 'react'
import FileUpload from '../components/FileUpload'
import TopicManager from '../components/TopicManager'
import AnalysisResults from '../components/AnalysisResults'
import AnalysisController from '../components/AnalysisController'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import TitleAnimation from '@/components/TitleAnimation'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from "@/components/ui/button"

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
  const [showAnalysisSection, setShowAnalysisSection] = useState(true)

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

  const toggleAnalysisSection = () => setShowAnalysisSection(prev => !prev)

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
    <div className="container mx-auto px-1 py-4">
      <div className="flex justify-between items-center mb-2">
        <div className="w-1/3"></div>
        <TitleAnimation className="text-2xl font-bold w-1/3 text-center" />
        <div className="w-1/3 flex justify-end">
          <ThemeSwitcher />
        </div>
      </div>
      <div className="grid md:grid-cols-5 gap-4">
        <div className="md:col-span-3">
          <div className="bg-card rounded-lg shadow-md mb-4">
            <div className="p-4">
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
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="bg-card rounded-lg shadow-md mb-4">
            <Button
              onClick={toggleAnalysisSection}
              variant="ghost"
              className="w-full flex justify-between items-center py-2 px-4"
            >
              <span>Analysis Controls</span>
              {showAnalysisSection ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </Button>
            {showAnalysisSection && (
              <div className="p-4">
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
              </div>
            )}
          </div>
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