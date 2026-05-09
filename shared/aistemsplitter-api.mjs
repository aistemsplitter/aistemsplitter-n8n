const DEFAULT_API_BASE_URL = 'https://api.aistemsplitter.org/v1';

export class AIStemSplitterIntegrationError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'AIStemSplitterIntegrationError';
    this.status = status;
    this.code = code;
  }
}

export function normalizeConfig(config) {
  if (!config.apiKey) {
    throw new AIStemSplitterIntegrationError(
      'Missing AIStemSplitter API key',
      0,
      'CONFIG_ERROR',
    );
  }

  return {
    ...config,
    apiBaseUrl: (config.apiBaseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, ''),
  };
}

export async function getCredits(config, fetchImpl = globalThis.fetch) {
  const normalized = normalizeConfig(config);
  const response = await fetchImpl(`${normalized.apiBaseUrl}/credits`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${normalized.apiKey}`,
    },
  });

  return parseApiResponse(response);
}

export async function createSplit(config, fetchImpl = globalThis.fetch) {
  const normalized = normalizeConfig(config);
  const response = await fetchImpl(`${normalized.apiBaseUrl}/audio/splits`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${normalized.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: {
        type: 'direct_url',
        url: normalized.audioUrl,
      },
      stemModel: normalized.stemModel || '6s',
      outputFormat: normalized.outputFormat || 'mp3',
    }),
  });

  return parseApiResponse(response);
}

export async function getSplit(config, fetchImpl = globalThis.fetch) {
  const normalized = normalizeConfig(config);
  const response = await fetchImpl(
    `${normalized.apiBaseUrl}/audio/splits/${encodeURIComponent(normalized.splitId)}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${normalized.apiKey}`,
      },
    },
  );

  return parseApiResponse(response);
}

async function parseApiResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (response.ok && payload.success === true && 'data' in payload) {
    return payload.data;
  }

  if (payload.success === false && payload.error) {
    throw new AIStemSplitterIntegrationError(
      payload.error.message,
      response.status,
      payload.error.code,
    );
  }

  throw new AIStemSplitterIntegrationError(
    `AIStemSplitter API request failed with status ${response.status}`,
    response.status,
    'HTTP_ERROR',
  );
}
