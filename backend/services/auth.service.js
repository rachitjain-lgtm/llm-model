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

/**
 * Google OAuth login/register:
 * Accepts a Google ID token (credential from @react-oauth/google),
 * verifies it via Google tokeninfo endpoint, and creates or finds the user.
 */
const googleLoginUser = async ({ credential }) => {
  if (!credential) {
    throw new Error('Google credential is required');
  }

  // Verify the Google ID token via Google's tokeninfo endpoint
  const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
  const tokenInfo = await tokenInfoRes.json();

  if (!tokenInfoRes.ok || tokenInfo.error) {
    throw new Error('Invalid Google token. Please try again.');
  }

  const { email, name, picture, sub: googleId } = tokenInfo;

  if (!email) {
    throw new Error('Could not retrieve email from Google account.');
  }

  const db = getDb();
  const usersCollection = db.collection('users');
  const refreshTokensCollection = db.collection('refresh_tokens');

  // Find or create user
  let user = await usersCollection.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Register new user via Google
    const newUser = {
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      googleId,
      avatar: picture || null,
      role: 'user',
      provider: 'google',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await usersCollection.insertOne(newUser);
    user = { ...newUser, _id: result.insertedId };
  } else if (!user.googleId) {
    // Link Google to existing account
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { googleId, avatar: picture || user.avatar, updatedAt: new Date() } }
    );
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
    user: {
      id: userId,
      name: user.name,
      email: user.email,
      avatar: user.avatar || picture || null,
      role: user.role || 'user',
    },
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

const crypto = require('crypto');

const generatePasswordResetToken = async ({ email }) => {
  if (!email) {
    throw new Error('Email is required');
  }

  const db = getDb();
  const usersCollection = db.collection('users');
  const user = await usersCollection.findOne({ email: email.toLowerCase().trim() });
  
  if (!user) {
    throw new Error('No user found with this email address');
  }

  const token = crypto.randomBytes(20).toString('hex');
  const expires = new Date();
  expires.setHours(expires.getHours() + 1); // 1 hour expiry

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $set: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
        updatedAt: new Date()
      }
    }
  );

  return token;
};

const resetUserPassword = async ({ email, token, newPassword }) => {
  if (!email || !token || !newPassword) {
    throw new Error('Email, token, and new password are required');
  }

  const db = getDb();
  const usersCollection = db.collection('users');
  const user = await usersCollection.findOne({
    email: email.toLowerCase().trim(),
    resetPasswordToken: token
  });

  if (!user || !user.resetPasswordExpires || new Date(user.resetPasswordExpires) < new Date()) {
    throw new Error('Password reset token is invalid or has expired');
  }

  const hashedPassword = await hashPassword(newPassword);

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $set: {
        password: hashedPassword,
        updatedAt: new Date()
      },
      $unset: {
        resetPasswordToken: '',
        resetPasswordExpires: ''
      }
    }
  );

  return true;
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
  googleLoginUser,
  refreshAuthToken,
  logoutUser,
  generatePasswordResetToken,
  resetUserPassword,
};