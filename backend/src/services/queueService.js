const { pushTranslationJob } = require('../redis/queue');

const enqueueTranslationJob = async ({
  messageId,
  chatId,
  senderId,
  receiverId,
  text,
  sourceLanguage,
  targetLanguage,
}) => {
  await pushTranslationJob({
    messageId,
    chatId,
    senderId,
    receiverId,
    text,
    sourceLanguage,
    targetLanguage,
    queuedAt: new Date().toISOString(),
  });
};

module.exports = {
  enqueueTranslationJob,
};
