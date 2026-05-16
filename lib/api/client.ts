/**
 * Production fetch wrapper used by the UI.
 * Returns parsed JSON or throws a typed error with a user-facing message.
 */

export class FetchError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, opts?: { code?: string; details?: unknown }) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
    this.code = opts?.code;
    this.details = opts?.details;
  }

  /** Friendly message safe to display to end users. */
  get userMessage(): string {
    if (this.status === 401) return 'Please sign in again to continue.';
    if (this.status === 403) return 'You don\'t have access to this resource.';
    if (this.status === 404) return 'We couldn\'t find what you were looking for.';
    if (this.status === 422) return this.message || 'Some fields look invalid.';
    if (this.status === 429) return 'Too many requests. Please slow down and try again.';
    if (this.status >= 500) return 'Our servers hit a snag. Try again in a moment.';
    return this.message || 'Something went wrong.';
  }
}

export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT = 30_000;

export async function apiFetch<T = unknown>(
  url: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { body, timeoutMs = DEFAULT_TIMEOUT, headers, ...rest } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const init: RequestInit = {
      ...rest,
      signal: controller.signal,
      headers: {
        ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...(headers as Record<string, string>),
      },
      body:
        body == null
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
    };

    const res = await fetch(url, init);

    // Try to parse JSON regardless of status
    let data: any = null;
    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      try {
        data = await res.json();
      } catch {
        // ignore
      }
    }

    if (!res.ok) {
      const message =
        (data && (data.error || data.message)) ||
        `Request failed (${res.status})`;
      throw new FetchError(message, res.status, {
        code: data?.code,
        details: data?.details,
      });
    }

    return data as T;
  } catch (err) {
    if (err instanceof FetchError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new FetchError(
        'The request took too long. Check your connection and try again.',
        0,
        { code: 'timeout' }
      );
    }
    if (err instanceof TypeError) {
      throw new FetchError(
        'Network problem. Check your connection and try again.',
        0,
        { code: 'network_error' }
      );
    }
    throw new FetchError(
      err instanceof Error ? err.message : 'Unknown error',
      0,
      { code: 'unknown' }
    );
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  get: <T = unknown>(url: string, opts?: ApiFetchOptions) =>
    apiFetch<T>(url, { ...opts, method: 'GET' }),
  post: <T = unknown>(url: string, body?: unknown, opts?: ApiFetchOptions) =>
    apiFetch<T>(url, { ...opts, method: 'POST', body }),
  put: <T = unknown>(url: string, body?: unknown, opts?: ApiFetchOptions) =>
    apiFetch<T>(url, { ...opts, method: 'PUT', body }),
  patch: <T = unknown>(url: string, body?: unknown, opts?: ApiFetchOptions) =>
    apiFetch<T>(url, { ...opts, method: 'PATCH', body }),
  delete: <T = unknown>(url: string, opts?: ApiFetchOptions) =>
    apiFetch<T>(url, { ...opts, method: 'DELETE' }),
};
