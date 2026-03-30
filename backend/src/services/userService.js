const User = require('../models/User');

const listUsers = async (excludeUserId) => {
  return User.find({ _id: { $ne: excludeUserId } }).select('_id name email preferredLanguage').lean();
};

const getUserById = async (userId) => {
  return User.findById(userId).select('_id name email preferredLanguage').lean();
};

module.exports = {
  listUsers,
  getUserById,
};
