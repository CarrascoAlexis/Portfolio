const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const cookieParser = require('cookie-parser');

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// Configure CORS to allow credentials (cookies) from frontend origin
const corsOptions = { origin: FRONTEND_ORIGIN, credentials: true };
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
