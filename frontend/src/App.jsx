import { useEffect, useMemo, useRef, useState } from 'react';
import AuthPanel from './components/AuthPanel';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import { api, setAuthToken } from './lib/api';
import { createSocketConnection } from './lib/socket';

const ACCESS_TOKEN_KEY = 'chat_access_token';
const REFRESH_TOKEN_KEY = 'chat_refresh_token';

function normalizeMessage(message, profileLanguage) {
  if (!message) {
    return null;
  }

  if (message.text) {
    return message;
  }

  const translationEntry = message.translations && message.translations[profileLanguage];

  return {
    ...message,
    text: translationEntry?.text || message.originalText,
  };
}

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingText, setTypingText] = useState('');

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const activeChatOtherUserId = useMemo(() => {
    if (!activeChat || !profile) {
      return null;
    }

    const other = activeChat.participants.find((participant) => participant._id !== profile.id);
    return other?._id || null;
  }, [activeChat, profile]);

  const persistTokens = (accessToken, refreshToken) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    setAuthToken(accessToken);
  };

  const clearSession = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setAuthToken(null);
    setProfile(null);
    setUsers([]);
    setChats([]);
    setActiveChat(null);
    setMessages([]);
    setTypingText('');

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  const loadInitialData = async () => {
    const [meRes, usersRes, chatsRes] = await Promise.all([
      api.get('/auth/me'),
      api.get('/users'),
      api.get('/chats'),
    ]);

    setProfile(meRes.data.user);
    setUsers(usersRes.data.users);
    setChats(chatsRes.data.chats);
  };

  const loadChatMessages = async (chat) => {
    const response = await api.get(`/messages/chat/${chat._id}`);
    const incomingMessages = response.data.messages.map((message) => normalizeMessage(message, profile?.preferredLanguage));
    setMessages(incomingMessages.reverse());
  };

  const connectSocket = (accessToken) => {
    const socket = createSocketConnection(accessToken);

    socket.on('connect_error', (connectionError) => {
      setError(connectionError.message || 'Socket connection error');
    });

    socket.on('receive_message', (incoming) => {
      setMessages((previous) => {
        const exists = previous.some(
          (entry) => (entry._id && entry._id === incoming.messageId) || entry.messageId === incoming.messageId
        );

        if (exists) {
          return previous;
        }

        const normalized = normalizeMessage(
          {
            ...incoming,
            _id: incoming.messageId,
          },
          profile?.preferredLanguage
        );

        return [...previous, normalized];
      });
    });

    socket.on('typing', (payload) => {
      if (!activeChat || payload.chatId !== activeChat._id) {
        return;
      }

      if (payload.isTyping) {
        setTypingText('Typing...');
      } else {
        setTypingText('');
      }
    });

    socket.on('message_status', (payload) => {
      setMessages((previous) =>
        previous.map((entry) => {
          const id = entry._id || entry.messageId;
          if (id === payload.messageId) {
            return {
              ...entry,
              status: payload.status,
            };
          }

          return entry;
        })
      );
    });

    socketRef.current = socket;
  };

  const bootstrap = async () => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!accessToken) {
      return;
    }

    setAuthToken(accessToken);

    try {
      await loadInitialData();
      connectSocket(accessToken);
    } catch (bootstrapError) {
      clearSession();
    }
  };

  useEffect(() => {
    bootstrap();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleAuthSubmit = async ({ mode, name, email, password, preferredLanguage }) => {
    try {
      setError('');
      setLoading(true);

      const endpoint = mode === 'login' ? '/auth/login' : '/auth/signup';
      const payload = mode === 'login' ? { email, password } : { name, email, password, preferredLanguage };

      const response = await api.post(endpoint, payload);
      persistTokens(response.data.accessToken, response.data.refreshToken);
      await loadInitialData();
      connectSocket(response.data.accessToken);
    } catch (authError) {
      setError(authError.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async (participantId) => {
    try {
      const response = await api.post('/chats/direct', { participantId });
      const chat = response.data.chat;

      setChats((previous) => {
        const alreadyThere = previous.some((entry) => entry._id === chat._id);
        if (alreadyThere) {
          return previous;
        }

        return [chat, ...previous];
      });

      setActiveChat(chat);
      await loadChatMessages(chat);
    } catch (createChatError) {
      setError(createChatError.response?.data?.message || 'Could not create chat');
    }
  };

  const handleSelectChat = async (chat) => {
    setActiveChat(chat);
    setTypingText('');
    await loadChatMessages(chat);
  };

  const handleSendMessage = (text) => {
    if (!activeChat || !socketRef.current) {
      return;
    }

    socketRef.current.emit(
      'send_message',
      {
        chatId: activeChat._id,
        text,
      },
      (ack) => {
        if (!ack?.ok) {
          setError(ack?.message || 'Failed to send message');
        }
      }
    );
  };

  const handleTyping = (isTyping) => {
    if (!socketRef.current || !activeChat || !activeChatOtherUserId) {
      return;
    }

    socketRef.current.emit('typing', {
      toUserId: activeChatOtherUserId,
      chatId: activeChat._id,
      isTyping,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('typing', {
        toUserId: activeChatOtherUserId,
        chatId: activeChat._id,
        isTyping: false,
      });
    }, 600);
  };

  const handleMarkRead = (messageId) => {
    if (!socketRef.current || !messageId) {
      return;
    }

    socketRef.current.emit('mark_read', { messageId });
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (_error) {
      // Ignore logout API failures and clear local session regardless.
    } finally {
      clearSession();
    }
  };

  const handleLanguageChange = async (preferredLanguage) => {
    try {
      const response = await api.put('/auth/language', { preferredLanguage });
      setProfile(response.data.user);

      if (activeChat) {
        await loadChatMessages(activeChat);
      }
    } catch (updateError) {
      setError(updateError.response?.data?.message || 'Language update failed');
    }
  };

  if (!profile) {
    return (
      <>
        {error ? (
          <div className="fixed left-1/2 top-5 z-20 -translate-x-1/2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white shadow-lg">
            {error}
          </div>
        ) : null}
        <AuthPanel onSubmit={handleAuthSubmit} loading={loading} />
      </>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] p-2 md:p-4">
      {error ? (
        <div className="mb-3 rounded-xl bg-red-600 px-4 py-3 text-sm text-white">{error}</div>
      ) : null}

      <section className="grid h-[calc(100vh-1rem)] overflow-hidden rounded-3xl border border-white/50 shadow-2xl md:grid-cols-[340px_1fr]">
        <Sidebar
          profile={profile}
          users={users}
          chats={chats}
          activeChat={activeChat}
          onCreateChat={handleCreateChat}
          onSelectChat={handleSelectChat}
          onLogout={handleLogout}
          onLanguageChange={handleLanguageChange}
        />

        <ChatPanel
          profile={profile}
          activeChat={activeChat}
          messages={messages}
          typingText={typingText}
          onSend={handleSendMessage}
          onTyping={handleTyping}
          onMarkRead={handleMarkRead}
        />
      </section>
    </main>
  );
}
