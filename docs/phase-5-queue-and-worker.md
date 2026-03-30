# Phase 5 - Message Queue And Translation Worker

## Objective

Process translations asynchronously so sending messages stays fast and non-blocking.

## What Is Used And What They Are

- Queue pattern: Background job processing model.
- Redis BRPOP: Blocking pop for efficient worker polling.
- Worker process: Independent Node process for translation tasks.
- MongoDB update-on-complete: Persist translated payload and delivery status.

## Implemented In This Project

- Queue producer in backend/src/services/queueService.js.
- Worker consumer loop in backend/src/workers/translationWorker.js.
- Translation result persistence in backend/src/services/messageService.js.
- Socket event publishing in backend/src/redis/pubsub.js.

## End-To-End Flow

1. send_message stores original message immediately.
2. Server enqueues translation job with receiver language.
3. Worker consumes job from translation_queue.
4. Worker translates text (cache first).
5. Worker stores translation on message document.
6. Worker publishes receive_message + message_status events.

## Postman Test Steps

1. Run backend: npm run dev.
2. Run worker: npm run worker.
3. Send message in Postman Socket tab.
4. Verify receiver gets translated receive_message event.
5. Stop worker and send message to confirm queue backlog behavior.

## Why This Phase Matters

Without queueing, translation latency would block user sends and degrade UX. This phase gives resilience, responsiveness, and clean separation between request handling and expensive processing.
