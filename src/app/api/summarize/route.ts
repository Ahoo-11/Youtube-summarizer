import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { getVideoInfo, getVideoComments, extractVideoId } from '@/lib/youtube';
import { summarizeWithOpenRouter } from '@/lib/openrouter';

export async function POST(req: Request) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json(
      { error: 'No URL provided' },
      { status: 400 }
    );
  }

  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Get transcript
    const transcriptResponse = await YoutubeTranscript.fetchTranscript(videoId);
    const transcript = transcriptResponse.map(item => item.text).join(' ');

    if (!transcript) {
      return NextResponse.json(
        { error: 'Failed to get video transcript' },
        { status: 404 }
      );
    }

    // Get video info and comments in parallel
    const [videoInfo, comments, summary] = await Promise.all([
      getVideoInfo(videoId),
      getVideoComments(videoId),
      summarizeWithOpenRouter(transcript)
    ]);

    if (!videoInfo) {
      return NextResponse.json(
        { error: 'Failed to get video information' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      videoId,
      url,
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      channelTitle: videoInfo.channelTitle,
      channelId: videoInfo.channelId,
      summary,
      comments,
      date: new Date().toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error in summarize endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
