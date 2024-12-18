import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { router as summaryRouter } from './routes/summary';
import path from 'path';

// Load environment variables from .env file
dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

// Log environment variables (without sensitive data)
console.log('Starting server...');
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('YOUTUBE_API_KEY exists:', !!process.env.YOUTUBE_API_KEY);
console.log('OPENROUTER_API_KEY exists:', !!process.env.OPENROUTER_API_KEY);

const app = express();
const port = 3005; // Use a fixed port for testing

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow both dev servers
  credentials: true
}));

app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      port: port,
      hasYoutubeKey: !!process.env.YOUTUBE_API_KEY,
      hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY
    }
  });
});

// Routes
app.use('/', summaryRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

try {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Test endpoint: http://localhost:${port}/test`);
    console.log(`Health endpoint: http://localhost:${port}/health`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
}
