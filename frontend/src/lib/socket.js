import { io } from 'socket.io-client';

const SOCKET_BASE_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const createSocketConnection = (accessToken) => {
  return io(SOCKET_BASE_URL, {
    transports: ['websocket'],
    auth: {
      token: accessToken,
    },
    extraHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
