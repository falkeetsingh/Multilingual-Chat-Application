const jwt = require('jsonwebtoken');

const getEnvValue = (name) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not set in environment variables`);
  }

  return value;
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, getEnvValue('JWT_ACCESS_SECRET'), {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, getEnvValue('JWT_REFRESH_SECRET'), {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, getEnvValue('JWT_ACCESS_SECRET'));
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, getEnvValue('JWT_REFRESH_SECRET'));
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
