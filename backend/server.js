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

// Extra request context logs (helps debug CORS / preflight in Render logs)
app.use((req, res, next) => {
  if (req.url === '/health') return next();

  const origin = req.headers.origin || '(no origin header)';
  const host = req.headers.host || '(no host header)';
  const ua = req.headers['user-agent'] || '(no user-agent)';

  if (req.method === 'OPTIONS') {
    logger.info(
      `[CORS:preflight] ${req.method} ${req.originalUrl} origin=${origin} host=${host} ` +
      `acr-method=${req.headers['access-control-request-method'] || '(none)'} ` +
      `acr-headers=${req.headers['access-control-request-headers'] || '(none)'} ua="${ua}"`
    );
  } else {
    logger.info(
      `[REQ] ${req.method} ${req.originalUrl} origin=${origin} host=${host} ua="${ua}"`
    );
  }

  next();
});

/* =================================
   ✅ CORS CONFIGURATION
   ================================= */

// Allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://lms-frontend-dzgb.onrender.com',
  'https://lms-backend-tddw.onrender.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      logger.info(`CORS allowed origin: ${origin}`);
      callback(null, true);
    } else {
      // Log for debugging
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  // Expose useful headers (optional)
  exposedHeaders: ['Content-Length'],
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Apply CORS middleware before other middleware
app.use(cors(corsOptions));

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
