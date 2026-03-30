# Phase 1 - Project Planning & System Design

## 1) Problem Definition

Build a Progressive Web App that enables:

- Real-time user-to-user chat
- Automatic translation into each receiver's preferred language
- Persistent message history
- Low-latency delivery
- Basic scalability within free-tier infrastructure

## 2) Architecture Choice

**Chosen:** Modular monolith

### Why this fits

- Simpler than microservices for learning and MVP speed
- Easier local development and deployment on free tiers
- Still keeps clear boundaries by module (auth, chat, socket, translation, worker)

## 3) High-Level Components

1. **Frontend (React PWA)**
   - Authentication screens (signup/login)
   - Chat list + chat window + typing indicators
   - Socket.io client for real-time updates
   - PWA manifest + service worker for install/offline basics

2. **Backend API (Node.js + Express + Socket.io)**
   - REST endpoints for auth, users, chats, messages
   - Socket gateway for real-time events
   - Message ingest + queue publish

3. **Database (MongoDB Atlas)**
   - Source of truth for users/chats/messages
   - Message translations persisted for re-use

4. **Redis (Upstash)**
   - Translation cache
   - Message queue (`translation_queue`)
   - Online user map (`userId -> socketId`)

5. **Translation Worker (separate Node process)**
   - Consumes queue jobs
   - Calls translation service when cache miss
   - Updates DB/cache and emits translated message events

## 4) Message Lifecycle (Target Flow)

1. Sender emits `send_message` over Socket.io
2. Backend validates auth + chat membership
3. Backend stores original message in MongoDB (`originalText`, status=`sent`)
4. Backend enqueues translation job in Redis list `translation_queue`
5. Worker pops job, resolves receiver language(s)
6. Worker checks Redis cache key `translation:<textHash>:<lang>`
7. If miss, worker calls translation API and caches result
8. Worker updates message translations in MongoDB
9. Worker emits `receive_message` to receiver socket(s)
10. Receiver UI renders translated text (or fallback original)

## 5) Translation Strategy

**Strategy:** Lazy translation + caching

- Always persist original text first
- Translate on demand per target language
- Cache translation result in Redis with TTL
- Persist successful translation in message document for future retrieval

### Benefits

- Reduces external API calls and cost
- Supports language switching without repeated translation work
- Lowers latency for repeated/common phrases

## 6) Data Model Design (Initial)

## User

- `name: string`
- `email: string` (unique, indexed)
- `passwordHash: string`
- `preferredLanguage: string` (ISO code, e.g. `en`, `es`, `fr`)
- `createdAt`, `updatedAt`

## Chat

- `participants: ObjectId[]` (2 for 1:1 MVP)
- `lastMessageAt: Date`
- `createdAt`, `updatedAt`

## Message

- `chatId: ObjectId` (indexed)
- `senderId: ObjectId` (indexed)
- `originalText: string`
- `sourceLanguage: string | null`
- `translations: Record<languageCode, { text: string; translatedAt: Date }>`
- `status: 'sent' | 'delivered' | 'read'`
- `createdAt`, `updatedAt`

## Suggested Indexes

- `User.email` unique
- `Message.chatId + createdAt` compound index
- `Chat.participants` index for chat lookup

## 7) Socket Event Contract (Draft)

- `send_message`
  - payload: `{ chatId, text, clientMessageId }`
- `receive_message`
  - payload: `{ messageId, chatId, senderId, text, language, createdAt, status }`
- `typing`
  - payload: `{ chatId, userId, isTyping }`
- `message_status`
  - payload: `{ messageId, chatId, status }`

## 8) Non-Functional Targets (MVP)

- **Latency:** near real-time perceived delivery (< 1s typical for cached translations)
- **Reliability:** messages persisted before async translation
- **Scalability:** queue decouples translation API latency from sender UX
- **Cost Control:** aggressive translation caching and lazy translation

## 9) Security & Privacy Baseline

- JWT auth for REST + Socket handshake
- Password hashing with bcrypt
- Input validation and payload size limits
- CORS allowlist for frontend domain
- No secrets in repo; `.env` for keys

## 10) Free-Tier Deployment Plan

- Frontend on Vercel
- Backend + Socket.io on Render Web Service
- Redis on Upstash
- MongoDB on Atlas free cluster

## 11) Risks + Mitigations

1. **Cold starts on free-tier backend**
   - Mitigation: keep API lightweight; cache aggressively
2. **Translation API quota/cost**
   - Mitigation: Redis cache + lazy translation + optional fallback language
3. **Socket disconnects**
   - Mitigation: keep online map in Redis and re-register on reconnect
4. **Queue backlog**
   - Mitigation: monitor queue length and add worker retries/backoff

## 12) Phase 1 Validation Checklist

- [x] Clear architecture selected (modular monolith)
- [x] Component boundaries defined
- [x] Message flow defined end-to-end
- [x] Data model drafted for User/Chat/Message
- [x] Redis usage defined (cache + queue + online users)
- [x] Free-tier deployment targets selected
- [x] Key risks and mitigations documented

## 13) Phase 2 Entry Criteria

Before coding backend, confirm:

1. Auth approach: JWT with refresh token or access-only for MVP?
2. Chat scope: 1:1 only first, then groups later?
3. Translation provider: Google Cloud Translate (preferred) or fallback provider?
4. Worker mode: one worker process initially?

### Confirmed decisions

- Auth mode: JWT access + refresh token
- Chat scope: 1:1 only for initial release
- Translation provider: Google Cloud Translate
- Worker count: 1 translation worker process

## 14) Why This Phase Matters

This phase defines architectural boundaries, data contracts, and message lifecycle before implementation. It prevents rework, keeps free-tier deployment constraints realistic, and gives every later phase a clear reference for what to build and why.
