const {
  getRedisClient,
  isRedisReady,
} = require('./client');

const TRANSLATION_QUEUE_KEY = 'translation_queue';
const inMemoryQueue = [];

const pushTranslationJob = async (jobPayload) => {
  if (isRedisReady()) {
    const redis = getRedisClient();
    await redis.lpush(TRANSLATION_QUEUE_KEY, JSON.stringify(jobPayload));
    return;
  }

  inMemoryQueue.unshift(jobPayload);
};

const popTranslationJob = async () => {
  if (isRedisReady()) {
    const redis = getRedisClient();
    const response = await redis.brpop(TRANSLATION_QUEUE_KEY, 5);

    if (!response || !response[1]) {
      return null;
    }

    return JSON.parse(response[1]);
  }

  if (inMemoryQueue.length === 0) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return null;
  }

  return inMemoryQueue.pop();
};

module.exports = {
  TRANSLATION_QUEUE_KEY,
  pushTranslationJob,
  popTranslationJob,
};
