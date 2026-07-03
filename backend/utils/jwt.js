const jwt = require('jsonwebtoken');

const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'supersecretjwtkey1234567890',
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'supersecretrefreshjwtkey9876543210',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey1234567890');
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'supersecretrefreshjwtkey9876543210');
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};