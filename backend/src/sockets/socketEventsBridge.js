const { subscribeSocketEvents } = require('../redis/pubsub');
const { subscribeLocalSocketEvents } = require('./localSocketEventBus');

const startSocketEventsBridge = async (io) => {
  const forwardEvent = (eventName, payload) => {
    if (!payload || !payload.receiverId) {
      return;
    }

    io.to(`user:${payload.receiverId}`).emit(eventName, payload);

    if (payload.senderId) {
      io.to(`user:${payload.senderId}`).emit(eventName, payload);
    }
  };

  subscribeLocalSocketEvents(forwardEvent);

  const subscribed = await subscribeSocketEvents(forwardEvent);

  if (subscribed) {
    console.log('Socket pub/sub bridge started');
  } else {
    console.log('Socket bridge running in local event mode');
  }
};

module.exports = {
  startSocketEventsBridge,
};
