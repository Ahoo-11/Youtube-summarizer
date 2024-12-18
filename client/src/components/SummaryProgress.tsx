import React from 'react';
import { Box, LinearProgress, Typography, Paper } from '@mui/material';
import { VideoSummary } from '../types';

interface SummaryProgressProps {
  summary: VideoSummary;
}

const SummaryProgress: React.FC<SummaryProgressProps> = ({ summary }) => {
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        mb: 2, 
        backgroundColor: summary.status === 'error' ? '#ffebee' : '#fff' 
      }}
    >
      <Typography variant="subtitle1" gutterBottom>
        {summary.videoInfo.title || 'Loading video information...'}
      </Typography>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress 
          variant="determinate" 
          value={summary.progress} 
          color={summary.status === 'error' ? 'error' : 'primary'}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {summary.status === 'pending' && 'Generating summary...'}
        {summary.status === 'completed' && 'Summary completed'}
        {summary.status === 'error' && 'Error generating summary'}
      </Typography>
    </Paper>
  );
};

export default SummaryProgress;
