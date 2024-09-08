'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X } from "lucide-react"

export default function TopicManager({ topics, setTopics }) {
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
      {topics.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Topics:</h3>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center">
                {topic}
                <button onClick={() => removeTopic(topic)} className="ml-2 text-blue-800 hover:text-blue-900">
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