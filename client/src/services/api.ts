import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export interface VideoSummary {
  videoId: string;
  url: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  channelId: string;
  summary: string;
  comments: Comment[];
  date: string;
}

export interface Comment {
  text: string;
  likes: number;
  author: string;
}

export const summarizeVideo = async (url: string): Promise<VideoSummary> => {
  try {
    const response = await axios.post(`${API_URL}/summarize`, { url });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to summarize video');
    }
    throw new Error('Failed to connect to server');
  }
};
