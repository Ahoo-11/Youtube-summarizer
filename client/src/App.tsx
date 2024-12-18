import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import VideoSummaryCard from './components/VideoSummaryCard';
import Sidebar from './components/Sidebar';
import Archives from './pages/Archives';

const API_URL = 'http://localhost:3005';

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

function App() {
  const [url, setUrl] = useState('');
  const [summaries, setSummaries] = useState<VideoSummary[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<VideoSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('home');

  useEffect(() => {
    const savedSummaries = localStorage.getItem('summaries');
    if (savedSummaries) {
      setSummaries(JSON.parse(savedSummaries));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('summaries', JSON.stringify(summaries));
  }, [summaries]);

  const handleSubmit = async (e: React.FormEvent | null) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!url) return;

    setLoading(true);
    setError(null);
    
    try {
      // First check if the server is running
      const healthCheck = await fetch(`${API_URL}/health`);
      if (!healthCheck.ok) {
        throw new Error('Server is not responding');
      }

      const response = await fetch(`${API_URL}/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate summary');
      }

      const data: VideoSummary = await response.json();
      setSummaries(prev => [data, ...prev]);
      setSelectedSummary(data);
      setUrl('');
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#121212' }}>
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 280px)` },
          ml: { sm: `280px` },
        }}
      >
        {currentTab === 'home' ? (
          <>
            <Typography variant="h3" sx={{ mb: 4, color: '#ffffff' }}>
              YouTube Video Summarizer
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="YouTube URL"
                  variant="outlined"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.23)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={() => handleSubmit(null)}
                  disabled={loading || !url}
                  sx={{ minWidth: 150 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Get Summary'}
                </Button>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}

            {selectedSummary && (
              <VideoSummaryCard summary={selectedSummary} />
            )}

            {summaries.length > 0 && !selectedSummary && (
              <Box>
                <Typography variant="h5" gutterBottom sx={{ mt: 4, color: '#ffffff' }}>
                  Previous Summaries
                </Typography>
                {summaries.map((summary, index) => (
                  <VideoSummaryCard key={summary.videoId || index} summary={summary} />
                ))}
              </Box>
            )}
          </>
        ) : (
          <Archives 
            summaries={summaries} 
            onSelectSummary={(summary) => {
              setSelectedSummary(summary);
              setCurrentTab('home');
            }} 
          />
        )}
      </Box>
    </Box>
  );
}

export default App;
