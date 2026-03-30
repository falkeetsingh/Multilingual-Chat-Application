const userService = require('../services/userService');

const listUsers = async (req, res, next) => {
  try {
    const users = await userService.listUsers(req.user.userId);
    return res.status(200).json({ users });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listUsers,
};
