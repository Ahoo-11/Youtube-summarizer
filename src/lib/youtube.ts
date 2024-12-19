import { google } from 'googleapis';

const youtube = google.youtube('v3');

interface VideoInfo {
  title: string;
  thumbnail: string;
  channelTitle: string;
  channelId: string;
}

export async function getVideoInfo(videoId: string): Promise<VideoInfo | null> {
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

export async function getVideoComments(videoId: string, maxComments: number = 10) {
  try {
    const response = await youtube.commentThreads.list({
      part: ['snippet'],
      videoId: videoId,
      maxResults: 100,
      order: 'relevance',
      key: process.env.YOUTUBE_API_KEY,
    });

    if (!response.data.items) return [];

    const sortedComments = response.data.items
      .map(item => ({
        text: item.snippet?.topLevelComment?.snippet?.textDisplay || '',
        likes: item.snippet?.topLevelComment?.snippet?.likeCount || 0,
        author: item.snippet?.topLevelComment?.snippet?.authorDisplayName || '',
      }))
      .sort((a, b) => b.likes - a.likes)
      .slice(0, maxComments);

    return sortedComments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^/?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^/?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}
