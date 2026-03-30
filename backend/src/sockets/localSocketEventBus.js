const { EventEmitter } = require('events');

const localEventBus = new EventEmitter();

const publishLocalSocketEvent = (eventName, payload) => {
  localEventBus.emit('socket_event', eventName, payload);
};

const subscribeLocalSocketEvents = (handler) => {
  localEventBus.on('socket_event', handler);
  return () => localEventBus.off('socket_event', handler);
};

module.exports = {
  publishLocalSocketEvent,
  subscribeLocalSocketEvents,
};
