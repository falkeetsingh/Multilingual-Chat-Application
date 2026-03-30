const userSockets = new Map();
const socketUsers = new Map();

const registerConnection = (userId, socketId) => {
  const existingSockets = userSockets.get(userId) || new Set();
  existingSockets.add(socketId);

  userSockets.set(userId, existingSockets);
  socketUsers.set(socketId, userId);
};

const unregisterConnection = (socketId) => {
  const userId = socketUsers.get(socketId);

  if (!userId) {
    return null;
  }

  const sockets = userSockets.get(userId);

  if (sockets) {
    sockets.delete(socketId);

    if (sockets.size === 0) {
      userSockets.delete(userId);
    }
  }

  socketUsers.delete(socketId);
  return userId;
};

const getSocketIdsForUser = (userId) => {
  const sockets = userSockets.get(userId);
  return sockets ? Array.from(sockets) : [];
};

const isUserOnline = (userId) => {
  return getSocketIdsForUser(userId).length > 0;
};

module.exports = {
  registerConnection,
  unregisterConnection,
  getSocketIdsForUser,
  isUserOnline,
};
