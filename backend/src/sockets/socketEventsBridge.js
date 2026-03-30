const { subscribeSocketEvents } = require('../redis/pubsub');

const startSocketEventsBridge = async (io) => {
  const subscribed = await subscribeSocketEvents((eventName, payload) => {
    if (!payload || !payload.receiverId) {
      return;
    }

    io.to(`user:${payload.receiverId}`).emit(eventName, payload);

    if (payload.senderId) {
      io.to(`user:${payload.senderId}`).emit(eventName, payload);
    }
  });

  if (subscribed) {
    console.log('Socket pub/sub bridge started');
  }
};

module.exports = {
  startSocketEventsBridge,
};
