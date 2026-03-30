const crypto = require('crypto');

const {
  getRedisClient,
  isRedisReady,
} = require('./client');

const inMemoryTranslationCache = new Map();
const DEFAULT_TTL_SECONDS = Number(process.env.TRANSLATION_CACHE_TTL_SECONDS || 86400);

const buildTranslationCacheKey = (text, targetLanguage) => {
  const textHash = crypto.createHash('sha256').update(text).digest('hex');
  return `translation:${textHash}:${targetLanguage}`;
};

const getCachedTranslation = async (text, targetLanguage) => {
  const key = buildTranslationCacheKey(text, targetLanguage);

  if (isRedisReady()) {
    const redis = getRedisClient();
    return redis.get(key);
  }

  return inMemoryTranslationCache.get(key) || null;
};

const setCachedTranslation = async (text, targetLanguage, translatedText) => {
  const key = buildTranslationCacheKey(text, targetLanguage);

  if (isRedisReady()) {
    const redis = getRedisClient();
    await redis.set(key, translatedText, 'EX', DEFAULT_TTL_SECONDS);
    return;
  }

  inMemoryTranslationCache.set(key, translatedText);
};

module.exports = {
  buildTranslationCacheKey,
  getCachedTranslation,
  setCachedTranslation,
};
