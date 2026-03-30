# Phase 4 - Redis Integration (Cache + Queue + Online Users)

## Objective

Introduce Redis for fast temporary state: translation cache, queue, online users, and pub/sub.

## What Is Used And What They Are

- ioredis: Robust Node.js Redis client.
- Redis cache: Key-value store for quick translation reuse.
- Redis list queue: translation_queue using LPUSH + BRPOP.
- Redis pub/sub: Cross-process event broadcasting.
- Upstash Redis: Free-tier managed Redis target.

## Implemented In This Project

- Redis client lifecycle in backend/src/redis/client.js.
- Queue helpers in backend/src/redis/queue.js.
- Translation cache helpers in backend/src/redis/translationCache.js.
- Online users mapping in backend/src/redis/onlineUsers.js.
- Pub/sub helpers in backend/src/redis/pubsub.js.
- Recent chat cache in backend/src/redis/recentMessagesCache.js.

## Key Redis Keys

- translation:<sha256(text)>:<lang>
- translation_queue
- online_user:<userId>
- chat_recent:<chatId>
- channel: socket_events

## End-To-End Flow

1. Server initializes Redis command/publisher/subscriber clients.
2. Message send pushes translation job to translation_queue.
3. Translation service checks translation cache first.
4. Online socket mapping is persisted in Redis.
5. Worker publishes events to socket_events channel.
6. API/socket servers consume and forward events to clients.

## Postman Test Steps

1. Start backend with REDIS_URL configured.
2. Send message via socket and verify ACK includes queued true.
3. Trigger translation endpoint twice and verify second call is cache hit behavior.
4. Disconnect/reconnect user and verify online behavior remains consistent.

## Why This Phase Matters

Redis removes repetitive expensive work and decouples latency-sensitive traffic from slow operations. This phase improves speed, cost-efficiency, and scale readiness.
