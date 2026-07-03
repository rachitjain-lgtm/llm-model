require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Connect to database asynchronously
  connectDB();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});