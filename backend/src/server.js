require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const connectDB = require('./config/db');
const initializeSocketServer = require('./sockets');
const { initializeRedis } = require('./redis/client');
const { startSocketEventsBridge } = require('./sockets/socketEventsBridge');
const startTranslationWorker = require('./workers/translationWorker');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await initializeRedis();

  const shouldRunWorkerInProcess =
    (process.env.RUN_TRANSLATION_WORKER_IN_PROCESS || 'true').toLowerCase() === 'true';

  if (shouldRunWorkerInProcess) {
    startTranslationWorker({ skipBootstrap: true }).catch((error) => {
      console.error('In-process worker failed:', error.message);
    });
  }

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
  });

  initializeSocketServer(io);
  await startSocketEventsBridge(io);

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the other process or change PORT.`);
      process.exit(1);
    }

    console.error('HTTP server error:', error.message);
    process.exit(1);
  });

  server.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
