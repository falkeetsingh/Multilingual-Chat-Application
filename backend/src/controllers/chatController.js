const chatService = require('../services/chatService');

const createOrGetDirectChat = async (req, res, next) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({ message: 'participantId is required' });
    }

    const chat = await chatService.getOrCreateDirectChat(req.user.userId, participantId);
    const populatedChat = await chat.populate('participants', '_id name email preferredLanguage');

    return res.status(200).json({ chat: populatedChat });
  } catch (error) {
    return next(error);
  }
};

const listChats = async (req, res, next) => {
  try {
    const chats = await chatService.listUserChats(req.user.userId);
    return res.status(200).json({ chats });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createOrGetDirectChat,
  listChats,
};
