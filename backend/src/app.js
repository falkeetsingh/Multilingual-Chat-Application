const express = require('express');
const cors = require('cors');

const apiRoutes = require('./routes');

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.use('/api', apiRoutes);

app.use((req, res) => {
  return res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'production') {
    return res.status(statusCode).json({ message, stack: err.stack });
  }

  return res.status(statusCode).json({ message });
});

module.exports = app;
