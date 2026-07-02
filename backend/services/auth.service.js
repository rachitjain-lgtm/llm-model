const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const registerUser = async ({ name, email, password }) => {
  const db = getDb();
  const usersCollection = db.collection('users');
  const refreshTokensCollection = db.collection('refresh_tokens');

  const existingUser = await usersCollection.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  const hashedPassword = await hashPassword(password);
  const newUser = {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await usersCollection.insertOne(newUser);
  const userId = result.insertedId.toString();

  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await refreshTokensCollection.insertOne({
    userId: result.insertedId,
    token: refreshToken,
    expiresAt,
    createdAt: new Date(),
  });

  return {
    user: { id: userId, name: newUser.name, email: newUser.email, role: newUser.role },
    accessToken,
    refreshToken,
  };
};

const loginUser = async ({ email, password }) => {
  const db = getDb();
  const usersCollection = db.collection('users');
  const refreshTokensCollection = db.collection('refresh_tokens');

  const user = await usersCollection.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const userId = user._id.toString();
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await refreshTokensCollection.insertOne({
    userId: user._id,
    token: refreshToken,
    expiresAt,
    createdAt: new Date(),
  });

  return {
    user: { id: userId, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};

const refreshAuthToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new Error('Refresh token is required');
  }

  const decoded = verifyRefreshToken(incomingRefreshToken);
  const db = getDb();
  const storedToken = await db.collection('refresh_tokens').findOne({
    token: incomingRefreshToken,
    userId: new ObjectId(decoded.id),
  });

  if (!storedToken) {
    throw new Error('Invalid or expired refresh token');
  }

  const newAccessToken = generateAccessToken(decoded.id);
  return { accessToken: newAccessToken };
};

const logoutUser = async (incomingRefreshToken) => {
  if (incomingRefreshToken) {
    const db = getDb();
    await db.collection('refresh_tokens').deleteOne({ token: incomingRefreshToken });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAuthToken,
  logoutUser,
};