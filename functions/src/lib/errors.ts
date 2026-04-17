import { Context } from 'hono';

export class ApiError extends Error {
  constructor(public code: number, public status: string, message: string) {
    super(message);
  }
}

export function err(c: Context, e: unknown) {
  if (e instanceof ApiError) {
    return c.json({ error: { code: e.code, status: e.status, message: e.message } }, e.code as any);
  }
  console.error(e);
  return c.json({ error: { code: 500, status: 'INTERNAL', message: 'Internal server error' } }, 500);
}

export const notFound = (msg = 'Not found') => new ApiError(404, 'NOT_FOUND', msg);
export const forbidden = (msg = 'Forbidden') => new ApiError(403, 'FORBIDDEN', msg);
export const badRequest = (msg: string) => new ApiError(400, 'BAD_REQUEST', msg);
export const unauthorized = (msg = 'Unauthorized') => new ApiError(401, 'UNAUTHORIZED', msg);
export const tooMany = (msg = 'Too many requests') => new ApiError(429, 'RATE_LIMITED', msg);
