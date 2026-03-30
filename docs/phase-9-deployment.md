# Phase 9 - Deployment (Free Tier)

## Objective

Deploy all project components with free-tier services.

## What Is Used And What They Are

- Vercel: Static frontend hosting with global CDN.
- Render: Node backend web service hosting.
- Upstash: Managed serverless Redis.
- MongoDB Atlas: Managed cloud MongoDB.

## Deployment Plan

### Frontend (Vercel)

1. Import frontend directory as Vercel project.
2. Build command: npm run build
3. Output directory: dist
4. Env vars:
   - VITE_API_BASE_URL=<render-backend-url>/api
   - VITE_SOCKET_URL=<render-backend-url>

### Backend (Render)

1. Create Render Web Service from backend directory.
2. Build command: npm install
3. Start command: npm start
4. Env vars:
   - MONGODB_URI
   - JWT_ACCESS_SECRET
   - JWT_REFRESH_SECRET
   - REDIS_URL
   - REDIS_TLS=true (if required by Upstash)
   - GOOGLE_TRANSLATE_API_KEY
   - CORS_ORIGIN=<vercel-frontend-url>

### Worker (Render Background Worker)

1. Create second service from same backend repo/folder.
2. Start command: npm run worker
3. Same env vars as backend service.

## End-To-End Runtime Flow In Cloud

1. Frontend sends API and socket traffic to Render backend.
2. Backend stores data in Atlas and enqueues jobs in Upstash.
3. Worker consumes queue and publishes translated events.
4. Backend relays status/message events to connected clients.

## Postman Production Test Steps

1. Run health check against deployed /api/health.
2. Perform signup/login/me against deployed API.
3. Open two Postman socket sessions to deployed backend URL.
4. Send messages and verify translated receive_message.

## Why This Phase Matters

Deployment validates architecture realism. Running on free-tier cloud services proves the system can work outside local development with minimal cost.
