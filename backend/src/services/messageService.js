const Message = require('../models/Message');
const { cacheRecentMessage, getRecentMessages } = require('../redis/recentMessagesCache');

const createMessage = async ({ chatId, senderId, originalText, sourceLanguage }) => {
  const message = await Message.create({
    chatId,
    senderId,
    originalText,
    sourceLanguage,
    status: 'sent',
  });

  await cacheRecentMessage(chatId, {
    _id: message._id,
    chatId: message.chatId,
    senderId: message.senderId,
    originalText: message.originalText,
    status: message.status,
    createdAt: message.createdAt,
  });

  return message;
};

const listMessagesForChat = async (chatId, page = 1, limit = 30) => {
  const skip = (page - 1) * limit;

  // DB is the source of truth for translations/read states after refresh/restart.
  const messages = await Message.find({ chatId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  if (page === 1 && messages.length === 0) {
    return getRecentMessages(chatId);
  }

  return messages;
};

const addTranslationToMessage = async ({ messageId, targetLanguage, translatedText }) => {
  const path = `translations.${targetLanguage}`;

  const updatedMessage = await Message.findByIdAndUpdate(
    messageId,
    {
      $set: {
        [path]: {
          text: translatedText,
          translatedAt: new Date(),
        },
        status: 'delivered',
        deliveredAt: new Date(),
      },
    },
    { returnDocument: 'after' }
  );

  return updatedMessage;
};

const getMessageById = async (messageId) => {
  return Message.findById(messageId);
};

const markMessageRead = async (messageId) => {
  return Message.findByIdAndUpdate(
    messageId,
    {
      status: 'read',
      readAt: new Date(),
    },
    { returnDocument: 'after' }
  );
};

module.exports = {
  createMessage,
  listMessagesForChat,
  addTranslationToMessage,
  getMessageById,
  markMessageRead,
};
