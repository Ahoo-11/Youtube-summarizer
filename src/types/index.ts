export interface Comment {
  text: string;
  likes?: number;
  author: string;
}

export interface VideoSummary {
  videoId: string;
  url: string;
  title: string;
  thumbnail?: string;
  channelTitle?: string;
  channelId?: string;
  summary: string;
  comments?: Comment[];
  date?: string;
}
