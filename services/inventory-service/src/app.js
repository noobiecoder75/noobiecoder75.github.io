const express = require('express');
const cors = require('cors');
const routes = require('./routes/inventoryRoutes');
const logger = require('./utils/logger');

const app = express();

// Enable CORS for the frontend
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add request logging
app.use(logger.requestLogger);

app.use(express.json());
app.use('/api', routes);

// Error handling middleware with logging
app.use((err, req, res, next) => {
  logger.error('Application error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    query: req.query,
    body: req.body
  });
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app; 