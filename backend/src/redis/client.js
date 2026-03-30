const Redis = require('ioredis');

let commandClient = null;
let publisherClient = null;
let subscriberClient = null;
let redisReady = false;

const buildRedisOptions = () => {
  const options = {};

  if (process.env.REDIS_TLS === 'true') {
    options.tls = {};
  }

  return options;
};

const initializeRedis = async () => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn('REDIS_URL not set. Redis-backed features will use memory fallback.');
    redisReady = false;
    return false;
  }

  if (commandClient && publisherClient && subscriberClient) {
    return redisReady;
  }

  const options = buildRedisOptions();

  commandClient = new Redis(redisUrl, options);
  publisherClient = new Redis(redisUrl, options);
  subscriberClient = new Redis(redisUrl, options);

  commandClient.on('error', (error) => {
    console.error('Redis command client error:', error.message);
    redisReady = false;
  });

  publisherClient.on('error', (error) => {
    console.error('Redis publisher error:', error.message);
    redisReady = false;
  });

  subscriberClient.on('error', (error) => {
    console.error('Redis subscriber error:', error.message);
    redisReady = false;
  });

  try {
    await Promise.all([
      commandClient.ping(),
      publisherClient.ping(),
      subscriberClient.ping(),
    ]);

    redisReady = true;
    console.log('Redis connected');
    return true;
  } catch (error) {
    console.error('Redis connection failed. Using memory fallback:', error.message);
    redisReady = false;
    return false;
  }
};

const getRedisClient = () => commandClient;
const getPublisherClient = () => publisherClient;
const getSubscriberClient = () => subscriberClient;
const isRedisReady = () => redisReady;

module.exports = {
  initializeRedis,
  getRedisClient,
  getPublisherClient,
  getSubscriberClient,
  isRedisReady,
};
