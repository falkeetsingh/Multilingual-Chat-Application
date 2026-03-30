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

## Deployment Guide (Free Tier)

### 1. Database Setup - MongoDB Atlas

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free-tier cluster (M0 Sandbox, 512MB storage)
3. Under "Network Access": Allow `0.0.0.0/0` (for production, restrict to Render IP)
4. Under "Database Access": Create a user with strong password
5. Click "Connect" → "Drivers" → Copy connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
   ```
6. Replace `username`, `password`, and `database-name`
7. Save as `MONGODB_URI` environment variable for backend

### 2. Redis Setup - Upstash

1. Sign up at [upstash.com](https://upstash.com) (free tier: 10KB database)
2. Create a Redis database (free tier region, e.g., us-east-1)
3. Copy the "Redis URL" from the database details page
4. Save as `REDIS_URL` environment variable for backend
5. Optional: Set `REDIS_TLS=true` if Upstash requires it

### 3. Translation API - Google Cloud

**Option A: Service Account JSON (Recommended)**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable "Cloud Translation API"
4. Go to "Service Accounts" → "Create Service Account"
5. Generate a key (JSON format)
6. Download the JSON file
7. In Render dashboard, add environment variable:
   - Key: `GOOGLE_APPLICATION_CREDENTIALS`
   - Value: `/etc/secrets/gcp-key.json`
8. Upload the JSON file as a "Secret File" in Render (see Render setup below)

**Option B: API Key (Simple)**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create API key from "Credentials"
3. In Render, set environment variable:
   - Key: `GOOGLE_TRANSLATE_API_KEY`
   - Value: `your-api-key`

### 4. Backend Deployment - Render

1. Sign up at [render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new "Web Service":
   - **Name**: `multilingual-chat-backend`
   - **Region**: Choose closest to data center
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (0.5 CPU, 512MB RAM)

4. Set environment variables:

   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=mongodb+srv://...
   REDIS_URL=redis://...
   REDIS_TLS=true
   CORS_ORIGIN=https://your-vercel-domain.vercel.app
   JWT_ACCESS_SECRET=your-random-secret-min-32-chars
   JWT_REFRESH_SECRET=your-random-secret-min-32-chars
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   TRANSLATION_CACHE_TTL_SECONDS=86400
   GOOGLE_CLOUD_PROJECT=your-gcp-project-id
   RUN_TRANSLATION_WORKER_IN_PROCESS=true
   ```

   If using service account JSON:
   - Add as "Secret File": `gcp-key.json` (upload the JSON file)
   - Set `GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/gcp-key.json`

   If using API key:
   - Set `GOOGLE_TRANSLATE_API_KEY=your-api-key`

5. Click "Create Web Service" and wait for deployment (~2-5 min)
6. Copy the deployed URL (e.g., `https://multilingual-chat-backend.onrender.com`)

### 5. Frontend Deployment - Vercel

1. Sign up at [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure project:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Set environment variables:

   ```
   VITE_API_BASE_URL=https://multilingual-chat-backend.onrender.com/api
   VITE_SOCKET_URL=https://multilingual-chat-backend.onrender.com
   ```

5. Click "Deploy" and wait (~1-2 min)
6. Your frontend URL will be provided (e.g., `https://multilingual-chat.vercel.app`)

### 6. Post-Deployment Checklist

- [ ] Backend health check: `https://your-backend-url/api/health` (should return `{"status":"ok"}`)
- [ ] Sign up a new user on frontend
- [ ] Create a chat with another user
- [ ] Send a message with language different from your profile language
- [ ] Verify message appears instantly in receiver's chat
- [ ] Verify message translates automatically within 5-10 seconds
- [ ] Check Render logs for worker: `Worker job: source=... target=...`
- [ ] Test translation switching in language preferences

### 7. Troubleshooting

**Messages not translating:**

- Check backend logs: `Worker job:` and `Worker translated:` messages
- Verify `RUN_TRANSLATION_WORKER_IN_PROCESS=true` is set
- Check GCP project has Cloud Translation API enabled
- Ensure service account has "Cloud Translate Service Agent" role (if using JSON)

**Messages not arriving:**

- Verify `CORS_ORIGIN` matches your frontend URL exactly
- Check browser console for Socket.io connection errors
- Confirm backend and frontend URLS are correct in `.env` files

**Connection timeouts:**

- Render free tier is slow on first request (cold start ~30sec)
- MongoDB Atlas may throttle free-tier connections
- Consider upgrading to paid tier if you have >5 concurrent users

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
