import React from 'react';
import { Grid, Paper, Box, Typography } from '@mui/material';
import { VideoSummary } from '../types';

interface ArchivesProps {
  summaries: VideoSummary[];
  onSelectSummary: (summary: VideoSummary) => void;
}

const Archives: React.FC<ArchivesProps> = ({ summaries, onSelectSummary }) => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, color: '#ffffff' }}>
        All Archives
      </Typography>
      
      <Grid container spacing={3}>
        {summaries.map((summary) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={summary.id}>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                transition: 'all 0.2s',
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => onSelectSummary(summary)}
            >
              {summary.videoInfo.thumbnail && (
                <Box
                  sx={{
                    width: '100%',
                    height: 180,
                    backgroundImage: `url(${summary.videoInfo.thumbnail})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              )}
              <Box sx={{ p: 2 }}>
                <Typography
                  sx={{
                    color: '#ffffff',
                    fontWeight: 500,
                    fontSize: '1rem',
                    lineHeight: 1.2,
                    mb: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {summary.videoInfo.title}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mt: 2
                }}>
                  <Typography 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.875rem',
                    }}
                  >
                    {summary.videoInfo.channelTitle}
                  </Typography>
                  <Typography 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '0.75rem',
                    }}
                  >
                    {new Date(summary.timestamp).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Archives;