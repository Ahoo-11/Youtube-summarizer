import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'YouTube Video Summarizer',
  description: 'Get AI-powered summaries of YouTube videos with top comments analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}