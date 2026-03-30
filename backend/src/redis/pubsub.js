const {
  getPublisherClient,
  getSubscriberClient,
  isRedisReady,
} = require('./client');

const SOCKET_EVENTS_CHANNEL = 'socket_events';

const publishSocketEvent = async (eventName, payload) => {
  if (!isRedisReady()) {
    return false;
  }

  const publisher = getPublisherClient();
  await publisher.publish(
    SOCKET_EVENTS_CHANNEL,
    JSON.stringify({
      eventName,
      payload,
    })
  );

  return true;
};

const subscribeSocketEvents = async (handler) => {
  if (!isRedisReady()) {
    return false;
  }

  const subscriber = getSubscriberClient();

  await subscriber.subscribe(SOCKET_EVENTS_CHANNEL);
  subscriber.on('message', (channel, message) => {
    if (channel !== SOCKET_EVENTS_CHANNEL) {
      return;
    }

    try {
      const parsed = JSON.parse(message);
      handler(parsed.eventName, parsed.payload);
    } catch (error) {
      console.error('Failed to parse socket event from pub/sub:', error.message);
    }
  });

  return true;
};

module.exports = {
  SOCKET_EVENTS_CHANNEL,
  publishSocketEvent,
  subscribeSocketEvents,
};
