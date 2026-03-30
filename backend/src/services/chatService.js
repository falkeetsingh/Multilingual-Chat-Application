const Chat = require('../models/Chat');

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureChatAccess = async (chatId, userId) => {
  const chat = await Chat.findById(chatId);

  if (!chat) {
    throw createHttpError('Chat not found', 404);
  }

  const isParticipant = chat.participants.some(
    (participantId) => participantId.toString() === userId.toString()
  );

  if (!isParticipant) {
    throw createHttpError('You are not a participant of this chat', 403);
  }

  return chat;
};

const getOrCreateDirectChat = async (userId, otherUserId) => {
  if (userId === otherUserId) {
    throw createHttpError('Cannot create chat with yourself', 400);
  }

  const participants = [userId, otherUserId].sort();

  let chat = await Chat.findOne({
    isGroup: false,
    participants: { $all: participants, $size: 2 },
  });

  if (!chat) {
    chat = await Chat.create({
      participants,
      isGroup: false,
      lastMessageAt: new Date(),
    });
  }

  return chat;
};

const listUserChats = async (userId) => {
  return Chat.find({ participants: userId })
    .populate('participants', '_id name email preferredLanguage')
    .populate('lastMessage', '_id originalText status createdAt senderId')
    .sort({ lastMessageAt: -1 });
};

const touchChatLastMessage = async (chatId, messageId) => {
  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: messageId,
    lastMessageAt: new Date(),
  });
};

module.exports = {
  ensureChatAccess,
  getOrCreateDirectChat,
  listUserChats,
  touchChatLastMessage,
};
