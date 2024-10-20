import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X, Wand2, Trash2 } from "lucide-react"

const TOPIC_COLORS = [
  'var(--topic-color-1)',
  'var(--topic-color-2)',
  'var(--topic-color-3)',
  'var(--topic-color-4)',
  'var(--topic-color-5)',
]

export default function TopicManager({ topics, setTopics, onGenerateTopicsChange, generateTopics }) {
  const [currentTopic, setCurrentTopic] = useState('')

  const addTopic = () => {
    if (currentTopic && !topics.includes(currentTopic)) {
      setTopics([...topics, currentTopic])
      setCurrentTopic('')
    }
  }

  const removeTopic = (topicToRemove) => {
    setTopics(topics.filter(topic => topic !== topicToRemove))
  }

  const clearAllTopics = () => {
    setTopics([])
  }

  return (
    <div className="bg-card p-4 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Input 
          className="flex-grow" 
          placeholder="Add a topic" 
          value={currentTopic}
          onChange={(e) => setCurrentTopic(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTopic()}
        />
        <Button onClick={addTopic} className="w-full md:w-auto">
          <Plus className="h-6 w-10 mr-2" />
          Add Topic
        </Button>
      </div>
      <div 
        className={`flex items-center justify-between p-4 rounded-lg mb-4 cursor-pointer transition-colors duration-300 ${
          generateTopics 
            ? 'bg-green-500 dark:bg-green-800 text-white' 
            : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
        }`}
        onClick={() => onGenerateTopicsChange(!generateTopics)}
      >
        <div className="flex items-center">
          <Wand2 className="h-6 w-6 mr-2" />
          <span className="text-lg font-semibold">Generate Topics</span>
        </div>
        <span className="text-sm font-medium">
          {generateTopics ? 'Enabled' : 'Disabled'}
        </span>
      </div>
      {topics.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Topics:</h3>
            <Button onClick={clearAllTopics} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic, index) => (
              <span key={index} className="text-xs font-semibold px-2.5 py-0.5 rounded flex items-center" style={{ backgroundColor: TOPIC_COLORS[index % TOPIC_COLORS.length] }}>
                {topic}
                <button onClick={() => removeTopic(topic)} className="ml-2 hover:text-opacity-75">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}