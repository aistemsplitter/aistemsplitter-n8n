const DEFAULT_API_BASE_URL = 'https://api.aistemsplitter.org/v1';

export type FetchImpl = (
  input: string,
  init?: RequestInit,
) => Promise<Response>;

export interface AIStemSplitterApiConfig {
  apiKey: string;
  apiBaseUrl?: string;
}

export interface CreateSplitConfig extends AIStemSplitterApiConfig {
  audioUrl: string;
  stemModel?: '4s' | '6s' | string;
  outputFormat?: 'mp3' | 'wav' | string;
}

export interface GetSplitConfig extends AIStemSplitterApiConfig {
  splitId: string;
}

export class AIStemSplitterIntegrationError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'AIStemSplitterIntegrationError';
    this.status = status;
    this.code = code;
  }
}

interface NormalizedBaseConfig {
  apiKey: string;
  apiBaseUrl: string;
}

function normalizeBaseConfig(
  config: AIStemSplitterApiConfig,
): NormalizedBaseConfig {
  if (!config.apiKey) {
    throw new AIStemSplitterIntegrationError(
      'Missing AIStemSplitter API key',
      0,
      'CONFIG_ERROR',
    );
  }

  return {
    apiKey: config.apiKey,
    apiBaseUrl: (config.apiBaseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, ''),
  };
}

export function normalizeConfig(
  config: AIStemSplitterApiConfig,
): NormalizedBaseConfig {
  return normalizeBaseConfig(config);
}

export async function getCredits(
  config: AIStemSplitterApiConfig,
  fetchImpl: FetchImpl = globalThis.fetch,
): Promise<unknown> {
  const normalized = normalizeBaseConfig(config);
  const response = await fetchImpl(`${normalized.apiBaseUrl}/credits`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${normalized.apiKey}`,
    },
  });

  return parseApiResponse(response);
}

export async function createSplit(
  config: CreateSplitConfig,
  fetchImpl: FetchImpl = globalThis.fetch,
): Promise<unknown> {
  const normalized = normalizeBaseConfig(config);
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
        url: config.audioUrl,
      },
      stemModel: config.stemModel || '6s',
      outputFormat: config.outputFormat || 'mp3',
    }),
  });

  return parseApiResponse(response);
}

export async function getSplit(
  config: GetSplitConfig,
  fetchImpl: FetchImpl = globalThis.fetch,
): Promise<unknown> {
  const normalized = normalizeBaseConfig(config);
  const response = await fetchImpl(
    `${normalized.apiBaseUrl}/audio/splits/${encodeURIComponent(config.splitId)}`,
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

interface ApiErrorPayload {
  success?: boolean;
  data?: unknown;
  error?: { message: string; code: string };
}

async function parseApiResponse(response: Response): Promise<unknown> {
  const payload = (await response.json().catch(() => ({}))) as ApiErrorPayload;
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
