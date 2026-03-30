# Phase 7 - Frontend (React + Tailwind + PWA)

## Objective

Deliver a responsive user interface for authentication, chat, real-time updates, and installable PWA support.

## What Is Used And What They Are

- React: Component-based UI library.
- Axios: HTTP client for REST APIs.
- socket.io-client: Real-time event client.
- Tailwind CSS (official Vite plugin): Utility-first styling framework.
- Service Worker + Manifest: Core PWA install/offline building blocks.

## Implemented In This Project

- App logic in frontend/src/App.jsx.
- Auth UI in frontend/src/components/AuthPanel.jsx.
- Sidebar/chat list in frontend/src/components/Sidebar.jsx.
- Chat window and composer in frontend/src/components/ChatPanel.jsx.
- API client in frontend/src/lib/api.js.
- Socket client in frontend/src/lib/socket.js.
- Tailwind setup via frontend/vite.config.js + frontend/src/styles.css.
- PWA assets in frontend/public/manifest.webmanifest and frontend/public/sw.js.

## End-To-End Flow

1. User logs in/signs up from AuthPanel.
2. Access token is stored locally and attached to API/socket requests.
3. Client fetches users/chats/messages.
4. Socket subscribes to receive_message, typing, message_status.
5. Sending message triggers queue-backed translation flow.
6. UI updates with translated payloads and status transitions.

## Postman + UI Test Steps

1. Start backend and worker.
2. Start frontend with npm run dev in frontend.
3. Open two browser sessions and log in as two users.
4. Create direct chat and send messages.
5. Verify typing/read status and language switching behavior.
6. Install PWA from browser install prompt/menu.

## Why This Phase Matters

Backend features are only valuable when users can reliably interact with them. This phase turns architecture into a usable product and adds installable-app behavior.
