const { verifyAccessToken } = require('../services/tokenService');
const chatService = require('../services/chatService');
const messageService = require('../services/messageService');
const userService = require('../services/userService');
const { enqueueTranslationJob } = require('../services/queueService');
const { publishSocketEvent } = require('../redis/pubsub');
const {
  setUserSocket,
  getUserSocket,
  removeUserSocket,
} = require('../redis/onlineUsers');

const extractToken = (socket) => {
  const authToken = socket.handshake.auth && socket.handshake.auth.token;
  if (authToken) {
    return authToken;
  }

  const authHeader = socket.handshake.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme === 'Bearer' && token) {
    return token;
  }

  return null;
};

const validateMessagePayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return 'Payload is required';
  }

  if (!payload.chatId || typeof payload.chatId !== 'string') {
    return 'chatId is required';
  }

  if (!payload.text || typeof payload.text !== 'string') {
    return 'text is required';
  }

  return null;
};

const initializeSocketServer = (io) => {
  io.use((socket, next) => {
    try {
      const token = extractToken(socket);

      if (!token) {
        return next(new Error('Unauthorized: access token is missing'));
      }

      const decoded = verifyAccessToken(token);
      socket.data.user = {
        userId: decoded.userId,
        email: decoded.email,
        preferredLanguage: decoded.preferredLanguage,
      };

      return next();
    } catch (error) {
      return next(new Error('Unauthorized: invalid access token'));
    }
  });

  io.on('connection', (socket) => {
    const { userId } = socket.data.user;
    const personalRoom = `user:${userId}`;

    setUserSocket(userId, socket.id).catch((error) => {
      console.error('Failed to save online user mapping:', error.message);
    });
    socket.join(personalRoom);

    console.log(`Socket connected: ${socket.id} for user: ${userId}`);

    socket.on('send_message', async (payload, ack) => {
      const validationError = validateMessagePayload(payload);

      if (validationError) {
        if (typeof ack === 'function') {
          ack({ ok: false, message: validationError });
        }
        return;
      }

      try {
        const chat = await chatService.ensureChatAccess(payload.chatId, userId);
        const receiver = chat.participants.find(
          (participantId) => participantId.toString() !== userId
        );

        if (!receiver) {
          throw new Error('Unable to resolve message receiver for this chat');
        }

        const receiverId = receiver.toString();
        const receiverUser = await userService.getUserById(receiverId);

        if (!receiverUser) {
          throw new Error('Receiver not found');
        }

        const newMessage = await messageService.createMessage({
          chatId: payload.chatId,
          senderId: userId,
          originalText: payload.text,
          sourceLanguage: socket.data.user.preferredLanguage,
        });

        await chatService.touchChatLastMessage(payload.chatId, newMessage._id);

        await enqueueTranslationJob({
          messageId: newMessage._id.toString(),
          chatId: payload.chatId,
          senderId: userId,
          receiverId,
          text: payload.text,
          sourceLanguage: socket.data.user.preferredLanguage,
          targetLanguage: receiverUser.preferredLanguage,
        });

        const senderEvent = {
          messageId: newMessage._id,
          chatId: payload.chatId,
          senderId: userId,
          receiverId,
          text: payload.text,
          language: socket.data.user.preferredLanguage,
          status: 'sent',
          createdAt: newMessage.createdAt,
        };

        io.to(personalRoom).emit('receive_message', senderEvent);

        if (typeof ack === 'function') {
          const receiverSocket = await getUserSocket(receiverId);
          ack({
            ok: true,
            data: {
              ...senderEvent,
              receiverOnline: Boolean(receiverSocket),
              queued: true,
            },
          });
        }
      } catch (error) {
        if (typeof ack === 'function') {
          ack({ ok: false, message: error.message || 'Message send failed' });
        }
      }
    });

    socket.on('typing', (payload = {}) => {
      if (!payload.toUserId || !payload.chatId) {
        return;
      }

      io.to(`user:${payload.toUserId}`).emit('typing', {
        chatId: payload.chatId,
        userId,
        isTyping: Boolean(payload.isTyping),
      });
    });

    socket.on('mark_read', async (payload = {}, ack) => {
      try {
        if (!payload.messageId) {
          throw new Error('messageId is required');
        }

        const updated = await messageService.markMessageRead(payload.messageId);
        if (!updated) {
          throw new Error('Message not found');
        }

        const statusPayload = {
          messageId: updated._id.toString(),
          chatId: updated.chatId.toString(),
          senderId: updated.senderId.toString(),
          receiverId: userId,
          status: updated.status,
          readAt: updated.readAt,
        };

        // Direct emit keeps read receipts working even if pub/sub is unavailable.
        io.to(`user:${statusPayload.receiverId}`).emit('message_status', statusPayload);
        io.to(`user:${statusPayload.senderId}`).emit('message_status', statusPayload);

        await publishSocketEvent('message_status', statusPayload);

        if (typeof ack === 'function') {
          ack({ ok: true });
        }
      } catch (error) {
        if (typeof ack === 'function') {
          ack({ ok: false, message: error.message });
        }
      }
    });

    socket.on('disconnect', () => {
      removeUserSocket(userId, socket.id).catch((error) => {
        console.error('Failed to remove online user mapping:', error.message);
      });
      console.log(`Socket disconnected: ${socket.id} for user: ${userId}`);
    });
  });
};

module.exports = initializeSocketServer;
