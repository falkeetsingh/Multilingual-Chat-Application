const authService = require('../services/authService');

const signup = async (req, res, next) => {
  try {
    const result = await authService.signup(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const result = await authService.refreshAccessToken(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.body);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.userId);
    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
};

const updateLanguage = async (req, res, next) => {
  try {
    const { preferredLanguage } = req.body;
    const user = await authService.updatePreferredLanguage(req.user.userId, preferredLanguage);
    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  signup,
  login,
  refresh,
  logout,
  me,
  updateLanguage,
};
