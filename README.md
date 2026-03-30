# Multilingual Real-Time Chat Application (PWA)

A complete MERN + Socket.io + Redis multilingual chat system with async translation worker and Progressive Web App frontend.

## Project Status

All requested phases are implemented in this workspace.

## Tech Stack

- Frontend: React (JavaScript), Vite, Tailwind CSS v4 (`@tailwindcss/vite`), Socket.io client, Axios
- Backend: Node.js, Express, Socket.io, Mongoose, JWT auth
- Database: MongoDB Atlas (or local MongoDB)
- Redis: Upstash Redis (or compatible Redis) for cache/queue/pub-sub
- Worker: Node background process for translation jobs
- Translation: Google Cloud Translate API (with fallback behavior when key is missing)

## Architecture

Modular monolith with bounded modules:

- API/Auth/Chat/Message controllers and services
- Socket gateway
- Redis integration layer
- Translation worker process

## Implemented Features

- JWT access + refresh authentication
- User preferred language management
- Real-time chat via Socket.io
- Async translation queue using Redis list
- Worker-based translation processing
- Redis translation cache
- Redis online-user mapping
- Redis pub/sub for event fanout
- Typing indicators
- Read receipts (`sent`, `delivered`, `read`)
- Recent message cache for chat history optimization
- Language switching support
- React chat UI with authentication
- PWA manifest + service worker registration

## Repository Structure

- backend: API server, socket server, models, services, Redis layer, worker
- frontend: React PWA client (JavaScript)
- docs: phase-by-phase implementation and testing docs

## Environment Configuration

### backend/.env

Copy from [backend/.env.example](backend/.env.example) and fill:

- PORT
- NODE_ENV
- MONGODB_URI
- CORS_ORIGIN
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- JWT_ACCESS_EXPIRES_IN
- JWT_REFRESH_EXPIRES_IN
- REDIS_URL
- REDIS_TLS
- TRANSLATION_CACHE_TTL_SECONDS
- GOOGLE_TRANSLATE_API_KEY

### frontend/.env

Copy from [frontend/.env.example](frontend/.env.example):

- VITE_API_BASE_URL
- VITE_SOCKET_URL

## Run Locally

### 1) Backend API

```bash
cd backend
npm install
npm run dev
```

### 2) Translation Worker

```bash
cd backend
npm run worker
```

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL (default): `http://localhost:5173`
Backend URL (default): `http://localhost:5000`

## API Endpoints

- GET /api/health
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- GET /api/auth/me
- PUT /api/auth/language
- GET /api/users
- GET /api/chats
- POST /api/chats/direct
- GET /api/messages/chat/:chatId
- POST /api/messages/:messageId/translate

## Socket Events

- Client -> Server:
  - send_message
  - typing
  - mark_read
- Server -> Client:
  - receive_message
  - typing
  - message_status

## Phase Documentation

- [Phase 1 - Planning & System Design](docs/phase-1-system-design.md)
- [Phase 2 - Backend Setup](docs/phase-2-backend-setup.md)
- [Phase 3 - WebSocket Integration](docs/phase-3-websocket-integration.md)
- [Phase 4 - Redis Integration](docs/phase-4-redis-integration.md)
- [Phase 5 - Queue + Worker](docs/phase-5-queue-and-worker.md)
- [Phase 6 - Translation Integration](docs/phase-6-translation-integration.md)
- [Phase 7 - Frontend + PWA](docs/phase-7-frontend-pwa.md)
- [Phase 8 - Advanced Features](docs/phase-8-advanced-features.md)
- [Phase 9 - Deployment](docs/phase-9-deployment.md)
- [Phase 10 - Testing & Optimization](docs/phase-10-testing-and-optimization.md)
- [Detailed Phase 3 Postman Testing](docs/phase-3-postman-testing.md)

## Tailwind Setup (As Requested)

Frontend uses the official Vite path:

1. Install `tailwindcss` and `@tailwindcss/vite`
2. Add `tailwindcss()` plugin in [frontend/vite.config.js](frontend/vite.config.js)
3. Import Tailwind in [frontend/src/styles.css](frontend/src/styles.css) using `@import "tailwindcss";`
4. Run `npm run dev`

## Deployment Targets (Free Tier)

- Frontend: Vercel
- Backend API + Socket.io: Render Web Service
- Worker: Render Background Worker
- Redis: Upstash
- MongoDB: Atlas Free Tier

## Notes

- If `EADDRINUSE` appears on port 5000, stop the old process or change PORT.
- For real translation results, set GOOGLE_TRANSLATE_API_KEY.
- If Redis is unavailable, memory fallback keeps local development functional.
