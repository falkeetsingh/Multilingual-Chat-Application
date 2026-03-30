const { getCachedTranslation, setCachedTranslation } = require('../redis/translationCache');
const { v2 } = require('@google-cloud/translate');

const { Translate } = v2;

let translateClient = null;

const getTranslateClient = () => {
  if (translateClient) {
    return translateClient;
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return null;
  }

  const clientOptions = {};

  if (process.env.GOOGLE_CLOUD_PROJECT) {
    clientOptions.projectId = process.env.GOOGLE_CLOUD_PROJECT;
  }

  translateClient = new Translate(clientOptions);
  return translateClient;
};

const translateWithGoogleApi = async ({ text, targetLanguage, sourceLanguage }) => {
  const client = getTranslateClient();

  if (client) {
    try {
      const [translatedText] = await client.translate(text, {
        to: targetLanguage,
        ...(sourceLanguage ? { from: sourceLanguage } : {}),
      });

      if (
        sourceLanguage &&
        sourceLanguage !== targetLanguage &&
        translatedText === text
      ) {
        const [autoDetectedTranslation] = await client.translate(text, {
          to: targetLanguage,
        });
        return autoDetectedTranslation;
      }

      return translatedText;
    } catch (error) {
      console.warn('Service-account translation failed, trying API key fallback:', error.message);
    }
  }

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

  if (!apiKey) {
    // Fallback keeps development functional when API key is missing.
    return `[${targetLanguage}] ${text}`;
  }

  const endpoint = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
      target: targetLanguage,
      ...(sourceLanguage ? { source: sourceLanguage } : {}),
      format: 'text',
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Translate API error: ${response.status} ${body}`);
  }

  const data = await response.json();
  const translation =
    data &&
    data.data &&
    data.data.translations &&
    data.data.translations[0] &&
    data.data.translations[0].translatedText;

  if (!translation) {
    throw new Error('Google Translate API returned empty translation');
  }

  if (sourceLanguage && sourceLanguage !== targetLanguage && translation === text) {
    const retryResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
        format: 'text',
      }),
    });

    if (retryResponse.ok) {
      const retryData = await retryResponse.json();
      const retryTranslation =
        retryData &&
        retryData.data &&
        retryData.data.translations &&
        retryData.data.translations[0] &&
        retryData.data.translations[0].translatedText;

      if (retryTranslation) {
        return retryTranslation;
      }
    }
  }

  return translation;
};

const translateTextWithCache = async ({ text, targetLanguage, sourceLanguage }) => {
  if (!text || !targetLanguage) {
    throw new Error('text and targetLanguage are required for translation');
  }

  if (sourceLanguage && sourceLanguage === targetLanguage) {
    return text;
  }

  const cached = await getCachedTranslation(text, targetLanguage);
  if (cached) {
    return cached;
  }

  const translated = await translateWithGoogleApi({ text, targetLanguage, sourceLanguage });
  await setCachedTranslation(text, targetLanguage, translated);
  return translated;
};

module.exports = {
  translateTextWithCache,
};
