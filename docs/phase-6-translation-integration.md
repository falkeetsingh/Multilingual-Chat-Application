# Phase 6 - Translation Integration (Google Cloud Translate)

## Objective

Translate messages to target user language using cache-first logic and external provider fallback.

## What Is Used And What They Are

- Google Cloud Translate API: Managed machine translation service.
- Translation cache: Redis-backed memoization layer.
- Source/target language routing: Uses sender language and receiver preference.

## Implemented In This Project

- Translation service in backend/src/services/translationService.js.
- Cache helpers in backend/src/redis/translationCache.js.
- Manual translation endpoint in backend/src/controllers/messageController.js.

## End-To-End Flow

1. Worker receives translation job with source and target languages.
2. Service computes cache key using text hash + target language.
3. If cached value exists, return immediately.
4. Else call Google Translate API.
5. Save translated text to cache and MongoDB message.translations.
6. Emit translated message to receiver room.

## Postman Test Steps

1. Add GOOGLE_TRANSLATE_API_KEY in backend/.env.
2. Send message from user A to user B with different preferred languages.
3. Verify receive_message text is translated.
4. Call POST /api/messages/:messageId/translate for additional target language.
5. Repeat same translation and verify fast cached response.

## Why This Phase Matters

Translation is the product differentiator. Cache-first translation controls cost and keeps low latency while supporting multilingual communication at scale.
