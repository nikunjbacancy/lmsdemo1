require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// HTTP Request Logging Middleware
app.use(morgan('dev'));

// Custom Morgan tokens for more detailed logging
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :response-time ms - :body', {
  skip: (req) => req.url === '/health',
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

/* =================================
   ✅ FIXED CORS CONFIGURATION
   ================================= */

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://lms-frontend-dzgb.onrender.com',
    'https://lms-backend-tddw.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// ✅ Explicitly handle preflight requests
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '✅ LifeNotes Backend is running successfully!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/login and /api/auth/register',
      notes: '/api/notes',
      health: '/health'
    },
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server after connecting to MongoDB
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error.message);
    logger.error('❌ Full error:', error);
    console.error('Error details:', error);
    process.exit(1);
  }
};

startServer();
