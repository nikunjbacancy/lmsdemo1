const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');

dotenv.config();

const app = express();

/* =================================
   ✅ FIXED CORS CONFIGURATION
   ================================= */

const allowedOrigins = [
  'http://localhost:3000',
  'https://lms-frontend-dzgb.onrender.com'
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// ✅ Explicitly handle preflight requests
app.options('*', cors(corsOptions));

/* =================================
   ✅ EXISTING MIDDLEWARE
   ================================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =================================
   ✅ YOUR EXISTING API ROUTES (UNCHANGED)
   ================================= */

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

/* =================================
   ✅ SERVER START
   ================================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
