# Phase 3 - Postman Testing Guide (Updated)

## Prerequisites

1. Start backend:

```bash
cd backend
npm run dev
```

2. Start worker (needed for translated delivery path):

```bash
cd backend
npm run worker
```

3. Base URL: `http://localhost:5000`

## Step 1 - Create Two Users

Use POST /api/auth/signup twice.

- User A language: `en`
- User B language: `es`
  Save both access tokens and user IDs.

## Step 2 - Create Direct Chat

Use POST /api/chats/direct with User A token.
Body:

```json
{
  "participantId": "<USER_B_ID>"
}
```

Save `chat._id` as `CHAT_ID`.

## Step 3 - Open Two Socket Sessions In Postman

Create two Socket.io tabs:

- Socket A with User A token
- Socket B with User B token
  Connection URL: `http://localhost:5000`

## Step 4 - Typing Event Test

From Socket A emit `typing`:

```json
{
  "toUserId": "<USER_B_ID>",
  "chatId": "<CHAT_ID>",
  "isTyping": true
}
```

Expected on Socket B: incoming `typing` event with same `chatId` and `userId` as User A.

## Step 5 - Send Message Event Test

From Socket A emit `send_message`:

```json
{
  "chatId": "<CHAT_ID>",
  "text": "Hello Bob"
}
```

Expected:

- ACK to sender: `{ ok: true, data: { queued: true, ... } }`
- Receiver gets `receive_message` after worker processes translation.

## Step 6 - Read Receipt Test

From Socket B emit `mark_read`:

```json
{
  "messageId": "<MESSAGE_ID_FROM_RECEIVE_EVENT>"
}
```

Expected:

- Both sockets get `message_status` with `status: "read"`.

## Step 7 - Manual Translation API Test

Use POST /api/messages/:messageId/translate with any target language.
Example:

```json
{
  "targetLanguage": "fr"
}
```

Expected: translated text and status response.

## Why This Test Is Important

This validates the full real-time contract: auth -> chat creation -> socket send -> queue -> worker -> translated receive -> read receipt status.
