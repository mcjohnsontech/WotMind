import { NextResponse } from 'next/server';

/**
 * Production-grade API error helper. Never leaks raw stack traces or DB messages.
 */

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status = 500, opts?: { code?: string; details?: unknown }) {
    super(message);
    this.status = status;
    this.code = opts?.code;
    this.details = opts?.details;
  }
}

export const errors = {
  badRequest: (message = 'Bad request', opts?: { code?: string; details?: unknown }) =>
    new ApiError(message, 400, opts),
  unauthorized: (message = 'You must be signed in') => new ApiError(message, 401),
  forbidden: (message = 'You don\'t have access to this resource') =>
    new ApiError(message, 403),
  notFound: (message = 'Not found') => new ApiError(message, 404),
  conflict: (message = 'Conflict', opts?: { code?: string }) => new ApiError(message, 409, opts),
  unprocessable: (message = 'Validation failed', details?: unknown) =>
    new ApiError(message, 422, { code: 'validation_error', details }),
  tooManyRequests: (message = 'Too many requests') => new ApiError(message, 429),
  internal: (message = 'Something went wrong') => new ApiError(message, 500),
};

interface ErrorResponseBody {
  error: string;
  code?: string;
  details?: unknown;
}

export function toResponse(err: unknown): NextResponse<ErrorResponseBody> {
  if (err instanceof ApiError) {
    return NextResponse.json(
      { error: err.message, code: err.code, details: err.details },
      { status: err.status }
    );
  }

  if (err instanceof Error) {
    // In development, surface the real message. In production, hide it.
    const isDev = process.env.NODE_ENV !== 'production';
    return NextResponse.json(
      {
        error: isDev ? err.message : 'Something went wrong on our end',
        code: 'internal_error',
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: 'Something went wrong on our end', code: 'internal_error' },
    { status: 500 }
  );
}

/**
 * Wrap a handler so any thrown error becomes a clean JSON response.
 * Logs the original error server-side; clients only see the sanitized message.
 */
export function withErrorHandling<TArgs extends unknown[]>(
  handler: (...args: TArgs) => Promise<Response> | Response
) {
  return async (...args: TArgs): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err) {
      console.error('[API error]', err);
      return toResponse(err);
    }
  };
}
