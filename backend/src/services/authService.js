const bcrypt = require('bcryptjs');

const User = require('../models/User');
const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} = require('./tokenService');

const languageRegex = /^[a-z]{2}(-[A-Z]{2})?$/;

const assertValidLanguage = (preferredLanguage) => {
  if (!languageRegex.test(preferredLanguage)) {
    const error = new Error('Invalid preferredLanguage format (use ISO code like en or en-US)');
    error.statusCode = 400;
    throw error;
  }
};

const toSafeUser = (userDoc) => {
  return {
    id: userDoc._id,
    name: userDoc.name,
    email: userDoc.email,
    preferredLanguage: userDoc.preferredLanguage,
  };
};

const buildTokenPayload = (userDoc) => ({
  userId: userDoc._id.toString(),
  email: userDoc.email,
  preferredLanguage: userDoc.preferredLanguage,
});

const getRefreshTokenExpiryDate = () => {
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + sevenDaysMs);
};

const issueTokenPair = async (userDoc) => {
  const payload = buildTokenPayload(userDoc);
  const accessToken = createAccessToken(payload);
  const refreshToken = createRefreshToken(payload);

  const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

  userDoc.refreshTokenHash = refreshTokenHash;
  userDoc.refreshTokenExpiresAt = getRefreshTokenExpiryDate();
  await userDoc.save();

  return {
    accessToken,
    refreshToken,
  };
};

const signup = async ({ name, email, password, preferredLanguage }) => {
  if (!name || !email || !password || !preferredLanguage) {
    const error = new Error('name, email, password, and preferredLanguage are required');
    error.statusCode = 400;
    throw error;
  }

  assertValidLanguage(preferredLanguage);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const userDoc = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    preferredLanguage,
  });

  const tokens = await issueTokenPair(userDoc);

  return {
    user: toSafeUser(userDoc),
    ...tokens,
  };
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error('email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const userDoc = await User.findOne({ email: email.toLowerCase() });
  if (!userDoc) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, userDoc.passwordHash);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const tokens = await issueTokenPair(userDoc);

  return {
    user: toSafeUser(userDoc),
    ...tokens,
  };
};

const refreshAccessToken = async ({ refreshToken }) => {
  if (!refreshToken) {
    const error = new Error('refreshToken is required');
    error.statusCode = 400;
    throw error;
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (tokenError) {
    const error = new Error('Invalid or expired refresh token');
    error.statusCode = 401;
    throw error;
  }

  const userDoc = await User.findById(decoded.userId);
  if (!userDoc || !userDoc.refreshTokenHash) {
    const error = new Error('Invalid refresh session');
    error.statusCode = 401;
    throw error;
  }

  if (userDoc.refreshTokenExpiresAt && userDoc.refreshTokenExpiresAt < new Date()) {
    const error = new Error('Refresh token expired');
    error.statusCode = 401;
    throw error;
  }

  const matches = await bcrypt.compare(refreshToken, userDoc.refreshTokenHash);
  if (!matches) {
    const error = new Error('Invalid refresh session');
    error.statusCode = 401;
    throw error;
  }

  const tokens = await issueTokenPair(userDoc);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

const logout = async ({ refreshToken }) => {
  if (!refreshToken) {
    return;
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    await User.findByIdAndUpdate(decoded.userId, {
      refreshTokenHash: null,
      refreshTokenExpiresAt: null,
    });
  } catch (error) {
    return;
  }
};

const getProfile = async (userId) => {
  const userDoc = await User.findById(userId).select('_id name email preferredLanguage');

  if (!userDoc) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return toSafeUser(userDoc);
};

const updatePreferredLanguage = async (userId, preferredLanguage) => {
  if (!preferredLanguage) {
    const error = new Error('preferredLanguage is required');
    error.statusCode = 400;
    throw error;
  }

  assertValidLanguage(preferredLanguage);

  const userDoc = await User.findByIdAndUpdate(
    userId,
    { preferredLanguage },
    { returnDocument: 'after' }
  );

  if (!userDoc) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return toSafeUser(userDoc);
};

module.exports = {
  signup,
  login,
  refreshAccessToken,
  logout,
  getProfile,
  updatePreferredLanguage,
};
