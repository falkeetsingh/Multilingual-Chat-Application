const chatService = require('../services/chatService');
const messageService = require('../services/messageService');
const { translateTextWithCache } = require('../services/translationService');

const listMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 30);

    await chatService.ensureChatAccess(chatId, req.user.userId);
    const messages = await messageService.listMessagesForChat(chatId, page, limit);

    return res.status(200).json({ messages });
  } catch (error) {
    return next(error);
  }
};

const translateMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { targetLanguage } = req.body;

    if (!targetLanguage) {
      return res.status(400).json({ message: 'targetLanguage is required' });
    }

    const message = await messageService.getMessageById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await chatService.ensureChatAccess(message.chatId, req.user.userId);

    const existingTranslation = message.translations.get(targetLanguage);
    if (existingTranslation && existingTranslation.text) {
      return res.status(200).json({
        messageId,
        targetLanguage,
        translatedText: existingTranslation.text,
        fromCache: true,
      });
    }

    const translatedText = await translateTextWithCache({
      text: message.originalText,
      targetLanguage,
      sourceLanguage: message.sourceLanguage || undefined,
    });

    const updated = await messageService.addTranslationToMessage({
      messageId,
      targetLanguage,
      translatedText,
    });

    return res.status(200).json({
      messageId,
      targetLanguage,
      translatedText,
      status: updated.status,
      fromCache: false,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listMessages,
  translateMessage,
};
