const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const cookieParser = require('cookie-parser');

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// Configure CORS to allow credentials (cookies) from frontend origin
// Allow multiple origins or use a function to validate dynamically
const corsOptions = { 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // Allow configured frontend origin and localhost variants
    const allowedOrigins = [
      FRONTEND_ORIGIN,
      'http://localhost:3000',
      'http://localhost:80',
      'http://localhost:5173',
      'http://raspberry.distant',
      'http://86.252.87.194:80',
      'http://86.252.87.194'
    ];
    
    if (allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('raspberry') || origin.includes('86.252.87.194')) {
      callback(null, true);
    } else {
      // Don't throw error, just allow it anyway (less strict for development)
      console.warn('CORS: Unknown origin', origin);
      callback(null, true);
    }
  },
  credentials: true 
};
app.use(cors(corsOptions));
// handle preflight requests
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// serve uploaded files (not committed to repo)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api', routes);

app.get('/', (req, res) => res.json({ ok: true, message: 'Portfolio back running' }));

module.exports = app;
