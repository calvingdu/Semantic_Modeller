import React, { useState } from 'react';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = 'http://127.0.0.1:5000';

export const analyzeDocuments = async (files, topics, minScore, generateTopics) => {
  const formData = new FormData();
  files.forEach((file, index) => {
    console.log(`Appending file ${index + 1}:`, file.name);
    formData.append('files', file.file);
  });
  formData.append('topics', topics.join(','));
  formData.append('min_score', minScore.toString());
  formData.append('generate_topics', generateTopics.toString());

  console.log('FormData contents:');
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  try {
    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error during analysis:', error);
    throw error;
  }
};

export default function AnalysisController({ files, topics, minScore, generateTopics, onAnalysisComplete, onAnalysisError, onTopicsGenerated, onGenerateTopicsChange }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
  
    const startAnalysis = async () => {
      if (files.length === 0) {
        onAnalysisError("Please upload files before starting the analysis.");
        return;
      }

      if (topics.length === 0 && !generateTopics) {
        onAnalysisError("Please add topics or enable topic generation before starting the analysis.");
        return;
      }
  
      setIsAnalyzing(true);
      // Disable topic generation when analysis starts
      onGenerateTopicsChange(false);

      try {
        const results = await analyzeDocuments(files, topics, minScore, generateTopics);
        console.log('Analysis results:', results);
        
        // Extract all topics from the results
        const allTopics = results.map(result => result.topic);
        
        // Identify newly generated topics
        const generatedTopics = allTopics.filter(topic => !topics.includes(topic));
        
        if (generatedTopics.length > 0) {
          onTopicsGenerated(generatedTopics);
        }
        
        onAnalysisComplete(results);
      } catch (error) {
        console.error('Error during analysis:', error);
        onAnalysisError(`Analysis failed: ${error.message}`);
      } finally {
        setIsAnalyzing(false);
      }
    };
  
    const isDisabled = files.length === 0 || (topics.length === 0 && !generateTopics);
  
    return (
        <div className="mt-4 mb-4 w-full">
          <div className="relative group">
            <div className={`
              absolute -inset-0.5 rounded-lg blur
              transition duration-1000
              ${isDisabled && !isAnalyzing
                ? 'bg-gray-400 dark:bg-gray-600 opacity-50' 
                : 'bg-gradient-to-r from-pink-600 to-purple-600 opacity-75'}
              ${isAnalyzing ? 'animate-pulse' : 'group-hover:animate-tilt group-hover:opacity-100'}
            `}></div>
            <Button 
              onClick={startAnalysis} 
              disabled={isDisabled || isAnalyzing}
              className={`
                relative w-full h-12 text-lg font-semibold
                bg-background text-foreground
                hover:bg-background/90 hover:text-foreground/90
                disabled:bg-background/50 disabled:text-foreground/50
                rounded-lg
              `}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Start Analysis"
              )}
            </Button>
          </div>
        </div>
      );
    }