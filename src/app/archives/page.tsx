'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import VideoSummaryCard from '@/components/VideoSummaryCard'
import { VideoSummary } from '@/types/index'

export default function Archives() {
  const [summaries, setSummaries] = useState<VideoSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const response = await fetch('/api/archives')
        if (!response.ok) {
          throw new Error('Failed to fetch archives')
        }
        const data = await response.json()
        setSummaries(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load archives')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSummaries()
  }, [])

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Archives</h1>
        <Link 
          href="/" 
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          Back to Home
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center py-8">
          {error}
        </div>
      )}

      {!isLoading && !error && summaries.length === 0 && (
        <p className="text-center text-gray-400 mt-8">No summaries found.</p>
      )}

      {!isLoading && !error && summaries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summaries.map((summary) => (
            <VideoSummaryCard key={summary.videoId} summary={summary} />
          ))}
        </div>
      )}
    </main>
  )
}
