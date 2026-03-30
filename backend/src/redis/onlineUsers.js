const {
  getRedisClient,
  isRedisReady,
} = require('./client');

const inMemoryUsers = new Map();

const buildOnlineUserKey = (userId) => `online_user:${userId}`;

const setUserSocket = async (userId, socketId) => {
  if (isRedisReady()) {
    const redis = getRedisClient();
    await redis.set(buildOnlineUserKey(userId), socketId, 'EX', 3600);
    return;
  }

  inMemoryUsers.set(userId, socketId);
};

const getUserSocket = async (userId) => {
  if (isRedisReady()) {
    const redis = getRedisClient();
    return redis.get(buildOnlineUserKey(userId));
  }

  return inMemoryUsers.get(userId) || null;
};

const removeUserSocket = async (userId, socketId) => {
  if (isRedisReady()) {
    const redis = getRedisClient();
    const current = await redis.get(buildOnlineUserKey(userId));

    if (!current || current === socketId) {
      await redis.del(buildOnlineUserKey(userId));
    }

    return;
  }

  const current = inMemoryUsers.get(userId);
  if (!current || current === socketId) {
    inMemoryUsers.delete(userId);
  }
};

module.exports = {
  setUserSocket,
  getUserSocket,
  removeUserSocket,
};
