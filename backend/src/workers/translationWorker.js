require('dotenv').config();

const connectDB = require('../config/db');
const { initializeRedis } = require('../redis/client');
const { popTranslationJob } = require('../redis/queue');
const { publishSocketEvent } = require('../redis/pubsub');
const { translateTextWithCache } = require('../services/translationService');
const { addTranslationToMessage } = require('../services/messageService');
const { publishLocalSocketEvent } = require('../sockets/localSocketEventBus');

let workerStarted = false;

const startTranslationWorker = async (options = {}) => {
  const { skipBootstrap = false } = options;

  if (workerStarted) {
    console.log('Translation worker is already running');
    return;
  }

  workerStarted = true;

  if (!skipBootstrap) {
    await connectDB();
    await initializeRedis();
  }

  console.log('Translation worker started');

  while (true) {
    try {
      const job = await popTranslationJob();

      if (!job) {
        continue;
      }

      console.log(
        `Worker job: message=${job.messageId} source=${job.sourceLanguage || 'auto'} target=${job.targetLanguage}`
      );

      const translatedText = await translateTextWithCache({
        text: job.text,
        targetLanguage: job.targetLanguage,
        sourceLanguage: job.sourceLanguage,
      });

      console.log(`Worker translated: message=${job.messageId} text="${translatedText}"`);

      const updatedMessage = await addTranslationToMessage({
        messageId: job.messageId,
        targetLanguage: job.targetLanguage,
        translatedText,
      });

      if (!updatedMessage) {
        console.warn(`Message not found for job: ${job.messageId}`);
        continue;
      }

      const receivePayload = {
        messageId: updatedMessage._id.toString(),
        chatId: updatedMessage.chatId.toString(),
        senderId: job.senderId,
        receiverId: job.receiverId,
        text: translatedText,
        language: job.targetLanguage,
        status: updatedMessage.status,
        createdAt: updatedMessage.createdAt,
      };

      const receivePublished = await publishSocketEvent('receive_message', receivePayload);
      if (!receivePublished) {
        publishLocalSocketEvent('receive_message', receivePayload);
      }

      const statusPayload = {
        messageId: updatedMessage._id.toString(),
        chatId: updatedMessage.chatId.toString(),
        senderId: job.senderId,
        receiverId: job.receiverId,
        status: updatedMessage.status,
        deliveredAt: updatedMessage.deliveredAt,
      };

      const statusPublished = await publishSocketEvent('message_status', statusPayload);
      if (!statusPublished) {
        publishLocalSocketEvent('message_status', statusPayload);
      }
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
