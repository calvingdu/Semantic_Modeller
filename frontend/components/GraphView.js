import React from 'react'

export default function GraphView() {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors duration-200">
      <div className="text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-xl font-semibold">Graph View Placeholder</p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Your graph visualization will appear here</p>
      </div>
    </div>
  )
}