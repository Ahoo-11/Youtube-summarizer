'use client'

import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { VideoSummary } from '@/types/index'

interface VideoSummaryCardProps {
  summary: VideoSummary
}

export default function VideoSummaryCard({ summary }: VideoSummaryCardProps) {
  if (!summary) return null;

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg mb-8">
      {summary.thumbnail && (
        <div className="relative h-48 w-full">
          <Image
            src={summary.thumbnail}
            alt={summary.title || 'Video thumbnail'}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
      
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2">{summary.title}</h2>
        {summary.channelTitle && (
          <p className="text-gray-400 mb-4">
            Channel: {summary.channelTitle}
          </p>
        )}
        {summary.url && (
          <a
            href={summary.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            View on YouTube
          </a>
        )}

        {summary.summary && (
          <>
            <hr className="my-6 border-gray-700" />
            <h3 className="text-xl font-semibold mb-4">Summary</h3>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{summary.summary}</ReactMarkdown>
            </div>
          </>
        )}

        {summary.comments && summary.comments.length > 0 && (
          <>
            <hr className="my-6 border-gray-700" />
            <h3 className="text-xl font-semibold mb-4">Top Comments</h3>
            <div className="space-y-4">
              {summary.comments.map((comment, index) => (
                <div key={index} className="bg-gray-900 rounded p-4">
                  <p className="text-gray-400 mb-2">
                    {comment.author} • {comment.likes?.toLocaleString() || '0'} likes
                  </p>
                  {comment.text && (
                    <div 
                      dangerouslySetInnerHTML={{ __html: comment.text }}
                      className="text-gray-300"
                    />
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
