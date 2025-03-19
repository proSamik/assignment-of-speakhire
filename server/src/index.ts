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

// Configure CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  // Add versions with and without trailing slash
  (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, ''),
  (process.env.CLIENT_URL || 'http://localhost:3000') + '/'
];

// Special route for the responses viewer - with its own CORS policy
// This must be defined BEFORE the main CORS middleware
app.get('/responses-viewer', (req, res, next) => {
  // Apply permissive CORS only for this route
  cors({ 
    origin: '*',
    methods: ['GET']
  })(req, res, () => {
    // Send the HTML file after CORS headers are set
    res.sendFile(path.join(__dirname, '../public/api-test.html'));
  });
});

// Create a CORS middleware that checks the referer
const checkRefererMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Check if the request is coming from our responses-viewer page
  const referer = req.headers.referer || '';
  
  if (referer.includes('/responses-viewer')) {
    // If from responses-viewer, bypass CORS checks
    return next();
  }
  
  // For all other requests, apply regular CORS checks
  cors({
    origin: function(origin, callback) {
      // Reject requests with no origin
      if (!origin) {
        return callback(new Error('Not allowed by CORS: No origin specified'), false);
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: Origin ${origin} not allowed`), false);
      }
    },
    credentials: true
  })(req, res, next);
};

// Configure CORS with referer checking
app.use(checkRefererMiddleware);

console.log(`CORS configured to allow origins:`, allowedOrigins);
console.log('Requests from responses-viewer page will bypass CORS checks');

app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/surveys', surveyRoutes);
app.use('/api/responses', responseRoutes);

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