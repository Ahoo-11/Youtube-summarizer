'use client'

import { useState } from 'react'
import type { VideoSummary } from '@/types/index'

interface SummaryFormProps {
  onSummaryStart: () => void
  onSummaryComplete: (summary: VideoSummary) => void
  onError: () => void
}

export default function SummaryForm({ onSummaryStart, onSummaryComplete, onError }: SummaryFormProps) {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) {
      alert('Please enter a YouTube URL')
      return
    }

    if (!url.includes('youtube.com/') && !url.includes('youtu.be/')) {
      alert('Please enter a valid YouTube URL')
      return
    }

    setIsLoading(true)
    onSummaryStart()

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to summarize video')
      }

      onSummaryComplete(data)
      setUrl('') // Clear the input after successful submission
    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'An error occurred')
      onError()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
          className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Processing...' : 'Get Summary'}
        </button>
      </div>
    </form>
  )
}
