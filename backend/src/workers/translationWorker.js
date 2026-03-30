require('dotenv').config();

const connectDB = require('../config/db');
const { initializeRedis } = require('../redis/client');
const { popTranslationJob } = require('../redis/queue');
const { publishSocketEvent } = require('../redis/pubsub');
const { translateTextWithCache } = require('../services/translationService');
const { addTranslationToMessage } = require('../services/messageService');

const startTranslationWorker = async () => {
  await connectDB();
  await initializeRedis();

  console.log('Translation worker started');

  while (true) {
    try {
      const job = await popTranslationJob();

      if (!job) {
        continue;
      }

      const translatedText = await translateTextWithCache({
        text: job.text,
        targetLanguage: job.targetLanguage,
        sourceLanguage: job.sourceLanguage,
      });

      const updatedMessage = await addTranslationToMessage({
        messageId: job.messageId,
        targetLanguage: job.targetLanguage,
        translatedText,
      });

      if (!updatedMessage) {
        console.warn(`Message not found for job: ${job.messageId}`);
        continue;
      }

      await publishSocketEvent('receive_message', {
        messageId: updatedMessage._id.toString(),
        chatId: updatedMessage.chatId.toString(),
        senderId: job.senderId,
        receiverId: job.receiverId,
        text: translatedText,
        language: job.targetLanguage,
        status: updatedMessage.status,
        createdAt: updatedMessage.createdAt,
      });

      await publishSocketEvent('message_status', {
        messageId: updatedMessage._id.toString(),
        chatId: updatedMessage.chatId.toString(),
        senderId: job.senderId,
        receiverId: job.receiverId,
        status: updatedMessage.status,
        deliveredAt: updatedMessage.deliveredAt,
      });
    } catch (error) {
      console.error('Worker loop error:', error.message);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};

if (require.main === module) {
  startTranslationWorker().catch((error) => {
    console.error('Worker failed:', error.message);
    process.exit(1);
  });
}

module.exports = startTranslationWorker;
