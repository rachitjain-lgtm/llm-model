const express = require('express');
const cors = require('cors');

const app = express();

// Basic Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Auth Routes
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// Chat Routes
const chatRoutes = require('./routes/chat.routes');
app.use('/api/chats', chatRoutes);

// Generate Routes (PDF, DOCX, PPTX, XLSX, Image)
const generateRoutes = require('./routes/generate.routes');
app.use('/api/generate', generateRoutes);

// Upload Routes
const uploadRoutes = require('./routes/upload.routes');
app.use('/api/upload', uploadRoutes);

// Basic Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;