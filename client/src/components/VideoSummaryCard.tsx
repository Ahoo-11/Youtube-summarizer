import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Divider, Link } from '@mui/material';
import ReactMarkdown from 'react-markdown';

interface Comment {
  text: string;
  likes: number;
  author: string;
}

interface VideoSummary {
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

interface VideoSummaryCardProps {
  summary: VideoSummary;
}

const VideoSummaryCard: React.FC<VideoSummaryCardProps> = ({ summary }) => {
  return (
    <Card sx={{ 
      bgcolor: '#ffffff',
      borderRadius: 2,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      mb: 4 
    }}>
      {summary.thumbnail && (
        <CardMedia
          component="img"
          height="200"
          image={summary.thumbnail}
          alt={summary.title}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {summary.title}
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            Channel: {summary.channelTitle}
          </Typography>
          <Link 
            href={summary.url} 
            target="_blank" 
            rel="noopener noreferrer"
            sx={{ color: '#1976d2', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            View on YouTube
          </Link>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        <Box sx={{ 
          mb: 3,
          '& p': { 
            marginBottom: '1em',
            lineHeight: 1.6
          }
        }}>
          <ReactMarkdown>{summary.summary}</ReactMarkdown>
        </Box>

        {summary.comments && summary.comments.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Top Comments
            </Typography>
            <Box>
              {summary.comments.map((comment, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {comment.author} • {comment.likes.toLocaleString()} likes
                  </Typography>
                  <Typography variant="body2">
                    <div dangerouslySetInnerHTML={{ __html: comment.text }} />
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoSummaryCard;
