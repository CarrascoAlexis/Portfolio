const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

// serve uploaded files (not committed to repo)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api', routes);

app.get('/', (req, res) => res.json({ ok: true, message: 'Portfolio back running' }));

module.exports = app;
