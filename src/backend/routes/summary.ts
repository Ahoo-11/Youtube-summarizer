import { Router } from 'express';
import { YoutubeTranscript } from 'youtube-transcript';
import { google } from 'googleapis';
import axios from 'axios';

const router = Router();
const youtube = google.youtube('v3');

interface VideoInfo {
  title: string;
  thumbnail: string;
  channelTitle: string;
  channelId: string;
}

async function getVideoInfo(videoId: string): Promise<VideoInfo | null> {
  try {
    const response = await youtube.videos.list({
      part: ['snippet'],
      id: [videoId],
      key: process.env.YOUTUBE_API_KEY,
    });

    if (response.data.items && response.data.items.length > 0) {
      const snippet = response.data.items[0].snippet!;
      return {
        title: snippet.title!,
        thumbnail: snippet.thumbnails?.high?.url || '',
        channelTitle: snippet.channelTitle!,
        channelId: snippet.channelId!,
      };
    }
  } catch (error) {
    console.error('Error fetching video info:', error);
  }
  return null;
}

async function getVideoComments(videoId: string, maxComments: number = 10) {
  try {
    // Request more comments to ensure we have enough to sort by likes
    const response = await youtube.commentThreads.list({
      part: ['snippet'],
      videoId: videoId,
      maxResults: 100, // Get more comments to find the most liked ones
      order: 'relevance',
      key: process.env.YOUTUBE_API_KEY,
    });

    if (!response.data.items) return [];

    // Sort comments by likes and get top 10
    const sortedComments = response.data.items
      .map(item => ({
        text: item.snippet?.topLevelComment?.snippet?.textDisplay || '',
        likes: item.snippet?.topLevelComment?.snippet?.likeCount || 0,
        author: item.snippet?.topLevelComment?.snippet?.authorDisplayName || '',
      }))
      .sort((a, b) => b.likes - a.likes) // Sort by likes in descending order
      .slice(0, maxComments); // Get top 10

    return sortedComments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

async function summarizeWithOpenRouter(text: string): Promise<string> {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3.5-haiku-20241022',
        messages: [
          {
            role: 'system',
            content: `You are an research expert working in the field for 18 years that creates detailed video summary breakdowns. 
            Please provide a clear, well-structured breakdown of the key points from the video, following these guidelines:
            
            1. Main Breakdown:
            - Focus on delivering the information promised in the title
            - For tutorial videos: outline specific steps and instructions
            - For review videos: include pros, cons, and overall conclusions
            - Extract and highlight:
              * Important conclusions
              * Key facts and information
              * Statistics and numerical data
              * Relevant dates
              * Names and references mentioned
            - Organize information in a clear, list format for easy reference
            - Adjust break down length based on information density
            - Ensure all significant details are captured
            - Use markdown formatting for better readability
            - Expert Opinion (Required): You should add these at the end of each breakdowns like if video as 7 breakdown points you need to give your opnion on each one.
                - Share your analysis of the content, tell me what you learn from that particular breakdown.
                - Point out any limitations or areas for further exploration    
                - Make sure to label as Expert opinion under each breakdown where you write the expert openion.
            
            2. Simple Summary (Required):
            End with a section labeled "## Simple Summary" that:
            - Explains the key takeaways in simple terms (6th-grade level)
            - Uses everyday language and clear examples
            - Avoids technical jargon
            - Focuses on practical understanding
            - Keeps it brief (2-3 sentences)
            
            Important: Do not generate or include any title or heading at the start of the summary. The video's original title will be used.`
          },
          {
            role: 'user',
            content: `Please analyze and summarize this video transcript following the specified format:\n\n${text}`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'YouTube Summary Tool'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error in OpenRouter API:', error);
    throw new Error('Failed to generate summary');
  }
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube.com\/shorts\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

router.post('/summarize', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Get transcript
    const transcriptResponse = await YoutubeTranscript.fetchTranscript(videoId);
    const transcript = transcriptResponse.map(item => item.text).join(' ');

    if (!transcript) {
      return res.status(404).json({ error: 'Failed to get video transcript' });
    }

    // Get video info
    const videoInfo = await getVideoInfo(videoId);
    if (!videoInfo) {
      return res.status(404).json({ error: 'Failed to get video information' });
    }

    // Get comments
    const comments = await getVideoComments(videoId);

    // Generate summary
    const summary = await summarizeWithOpenRouter(transcript);

    res.json({
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
    res.status(500).json({ error: error instanceof Error ? error.message : 'An error occurred' });
  }
});

router.post('/video-info', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const videoInfo = await getVideoInfo(videoId);
    if (!videoInfo) {
      return res.status(404).json({ error: 'Failed to get video information' });
    }

    res.json(videoInfo);
  } catch (error) {
    console.error('Error in video-info endpoint:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'An error occurred' });
  }
});

export { router };
