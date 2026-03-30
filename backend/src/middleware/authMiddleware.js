const { verifyAccessToken } = require('../services/tokenService');

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      preferredLanguage: decoded.preferredLanguage,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired access token' });
  }
};

module.exports = authMiddleware;
