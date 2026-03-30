# Phase 2 - Backend Setup (Express + MongoDB + Auth)

## Objective

Build a secure backend foundation with REST APIs, MongoDB persistence, and JWT authentication.

## What Is Used And What They Are

- Express: Node.js web framework for REST endpoints and middleware.
- Mongoose: ODM for MongoDB schemas, models, and queries.
- dotenv: Loads secrets/config from environment variables.
- cors: Controls allowed frontend origins.
- bcryptjs: Password hashing library.
- jsonwebtoken: Access and refresh token creation/validation.

## Implemented In This Project

- App bootstrap and middleware in backend/src/app.js.
- HTTP server startup in backend/src/server.js.
- MongoDB connector in backend/src/config/db.js.
- User model with preferred language in backend/src/models/User.js.
- Auth business logic in backend/src/services/authService.js.
- Token logic in backend/src/services/tokenService.js.
- Auth middleware in backend/src/middleware/authMiddleware.js.
- Auth endpoints in backend/src/routes/authRoutes.js.

## API Surface Implemented

- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- GET /api/auth/me
- PUT /api/auth/language
- GET /api/health

## End-To-End Flow

1. User signs up with name, email, password, preferredLanguage.
2. Password is hashed with bcrypt and stored.
3. Backend issues access and refresh JWT tokens.
4. Refresh token hash is stored on user document.
5. Protected APIs validate access token with Bearer header.
6. User profile and preferred language are used by later chat/translation phases.

## Postman Test Steps

1. GET /api/health and verify status 200.
2. POST /api/auth/signup and save accessToken + refreshToken.
3. GET /api/auth/me with Authorization Bearer token.
4. POST /api/auth/refresh with refreshToken and verify new token pair.
5. PUT /api/auth/language and verify preferredLanguage changes.

## Why This Phase Matters

This phase establishes identity, security, and persisted user settings. Every real-time and translation flow depends on authenticated users and preferred language metadata.
