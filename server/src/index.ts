/*
<aicontext>
This is the main entry point for the server application. It sets up Express with middleware, 
connects to the database, and initializes the API routes.
</aicontext>
*/ 

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './models/db';
import surveyRoutes from './routes/surveyRoutes';
import responseRoutes from './routes/responseRoutes';
import { runSeed } from './utils/runSeed';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
// In development, allow all origins for easier testing
if (process.env.NODE_ENV === 'development') {
  app.use(cors());
  console.log('CORS enabled for all origins in development mode');
} else {
  // In production, restrict to configured client URL
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }));
  console.log(`CORS restricted to origin: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
}

app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/surveys', surveyRoutes);
app.use('/api/responses', responseRoutes);

// Special route for the responses viewer
app.get('/responses-viewer', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/api-test.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    // Seed surveys from markdown files
    try {
      await runSeed();
      console.log('Surveys seeded successfully');
    } catch (seedError) {
      console.error('Error seeding surveys:', seedError);
      // Continue server startup even if seeding fails
    }
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`View responses at: http://localhost:${PORT}/responses-viewer`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer(); 