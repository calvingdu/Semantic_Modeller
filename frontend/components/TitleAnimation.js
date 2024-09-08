'use client'

import React, { useState, useEffect } from 'react'

export default function TitleAnimation() {
  const [titleText, setTitleText] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  const fullTitle = "References? Groupings? Semantics."

  useEffect(() => {
    let i = 0
    const typingInterval = setInterval(() => {
      if (i < fullTitle.length) {
        setTitleText(fullTitle.slice(0, i + 1))
        i++
      } else {
        clearInterval(typingInterval)
        setTimeout(() => setShowCursor(false), 500) // Hide cursor after 500ms
      }
    }, 100)

    return () => clearInterval(typingInterval)
  }, [])

  return (
    <h1 className="text-3xl md:text-5xl font-bold text-center mb-8 min-h-[1.5em]">
      <span className="text-primary">
        {titleText.split(' ').map((word, index, array) => (
          <React.Fragment key={index}>
            {index === array.length - 1 ? (
              <span className="text-blue-500">{word}</span>
            ) : (
              word
            )}
            {index < array.length - 1 && ' '}
          </React.Fragment>
        ))}
      </span>
      {showCursor && <span className="animate-blink">|</span>}
    </h1>
  )
}