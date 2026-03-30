# Phase 3 - WebSocket Integration (Socket.io)

## Objective

Enable low-latency bidirectional communication for chat and typing events.

## What Is Used And What They Are

- Socket.io: Real-time transport library over WebSocket with fallback support.
- JWT in socket handshake: Authenticates socket connections per user.
- Personal rooms: user:<userId> room naming for targeted event delivery.

## Implemented In This Project

- Socket server attached in backend/src/server.js.
- Connection auth and event handlers in backend/src/sockets/index.js.
- Socket pub/sub bridge in backend/src/sockets/socketEventsBridge.js.

## Events Implemented

- send_message: sender submits chat message.
- receive_message: delivered message event.
- typing: live typing indicator event.
- mark_read: receiver marks a message as read.
- message_status: sent/delivered/read status updates.

## End-To-End Flow

1. Client connects socket with access token.
2. Server verifies token and joins user room.
3. Sender emits send_message.
4. Server persists original message and queues translation work.
5. Worker publishes translated receive_message.
6. Server forwards message_status as state changes happen.

## Postman Test Steps

1. Create two users using auth APIs.
2. Open two Socket.io tabs in Postman (user A and user B).
3. Send typing from A to B and verify B receives typing.
4. Send send_message from A and verify ACK + eventual receive_message to B.
5. Emit mark_read from B and verify message_status reaches both users.

## Why This Phase Matters

Chat UX depends on instant delivery. This phase gives real-time behavior and lays the event contract used by Redis queueing, translation worker output, and read receipts.
