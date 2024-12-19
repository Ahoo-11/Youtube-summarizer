'use client'

import { useState } from 'react'
import Link from 'next/link'
import SummaryForm from '@/components/SummaryForm'
import VideoSummaryCard from '@/components/VideoSummaryCard'
import SummaryProgress from '@/components/SummaryProgress'
import type { VideoSummary } from '@/types'

export default function Home() {
  const [currentSummary, setCurrentSummary] = useState<VideoSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">YouTube Video Summarizer</h1>
        <Link 
          href="/archives" 
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          View Archives
        </Link>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <SummaryForm 
          onSummaryStart={() => setIsLoading(true)}
          onSummaryComplete={(summary) => {
            setCurrentSummary(summary)
            setIsLoading(false)
          }}
          onError={() => setIsLoading(false)}
        />
        
        {isLoading && <SummaryProgress />}
        
        {currentSummary && !isLoading && (
          <VideoSummaryCard summary={currentSummary} />
        )}
      </div>
    </main>
  )
}
