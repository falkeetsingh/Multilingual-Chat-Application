const {
  getRedisClient,
  isRedisReady,
} = require('./client');

const MAX_RECENT_MESSAGES = 20;
const inMemoryRecentMessages = new Map();

const buildRecentKey = (chatId) => `chat_recent:${chatId}`;

const cacheRecentMessage = async (chatId, message) => {
  if (isRedisReady()) {
    const redis = getRedisClient();
    const key = buildRecentKey(chatId);

    await redis.lpush(key, JSON.stringify(message));
    await redis.ltrim(key, 0, MAX_RECENT_MESSAGES - 1);
    await redis.expire(key, 3600);
    return;
  }

  const list = inMemoryRecentMessages.get(chatId) || [];
  list.unshift(message);
  inMemoryRecentMessages.set(chatId, list.slice(0, MAX_RECENT_MESSAGES));
};

const getRecentMessages = async (chatId) => {
  if (isRedisReady()) {
    const redis = getRedisClient();
    const values = await redis.lrange(buildRecentKey(chatId), 0, MAX_RECENT_MESSAGES - 1);
    return values.map((item) => JSON.parse(item));
  }

  return inMemoryRecentMessages.get(chatId) || [];
};

module.exports = {
  cacheRecentMessage,
  getRecentMessages,
};
