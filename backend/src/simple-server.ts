import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3001', 10);

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Budget Tracker API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Budget Tracker API v1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      categories: '/api/categories/*',
      transactions: '/api/transactions/*',
      budgets: '/api/budgets/*'
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Budget Tracker API server is running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
  console.log(`📚 API base URL: http://localhost:${port}/api`);
});
