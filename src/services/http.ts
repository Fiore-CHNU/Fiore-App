/**
 * Shared HTTP client for the Fiore API.
 * The base URL comes from VITE_API_BASE_URL (see .env.example) and defaults to the local backend.
 */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:5162/api/v1';

/** Error returned by the API, with the parsed JSON body when there is one. */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(`API request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }

  /** Business error code such as "PriceChanged" from `{ error: "..." }` bodies. */
  get code(): string | undefined {
    if (this.body && typeof this.body === 'object' && 'error' in this.body) {
      const value = (this.body as { error: unknown }).error;
      return typeof value === 'string' ? value : undefined;
    }
    return undefined;
  }

  /** Field errors from ASP.NET validation problems (`{ errors: { Field: [..] } }`). */
  get fieldErrors(): Record<string, string[]> {
    if (this.body && typeof this.body === 'object' && 'errors' in this.body) {
      const errors = (this.body as { errors: unknown }).errors;
      if (errors && typeof errors === 'object') return errors as Record<string, string[]>;
    }
    return {};
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  cartToken?: string;
  /** Staff JWT for /admin endpoints. */
  accessToken?: string;
  signal?: AbortSignal;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.cartToken) headers['X-Cart-Token'] = options.cartToken;
  if (options.accessToken) headers.Authorization = `Bearer ${options.accessToken}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });

  const text = await response.text();
  let parsed: unknown = undefined;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, parsed);
  }

  return parsed as T;
}

export const formatUah = (amount: number): string => `₴${amount.toLocaleString('uk-UA')}`;

const kyivTime = new Intl.DateTimeFormat('uk-UA', { timeZone: 'Europe/Kyiv', hour: '2-digit', minute: '2-digit' });
const kyivDate = new Intl.DateTimeFormat('uk-UA', { timeZone: 'Europe/Kyiv', day: 'numeric', month: 'long', weekday: 'short' });
const kyivDateTime = new Intl.DateTimeFormat('uk-UA', {
  timeZone: 'Europe/Kyiv',
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatSlotTime = (iso: string): string => kyivTime.format(new Date(iso));
export const formatSlotDate = (iso: string): string => kyivDate.format(new Date(iso));
export const formatDateTime = (iso: string): string => kyivDateTime.format(new Date(iso));
export const formatSlot = (fromIso: string, toIso: string): string =>
  `${formatSlotDate(fromIso)}, ${formatSlotTime(fromIso)}–${formatSlotTime(toIso)}`;
