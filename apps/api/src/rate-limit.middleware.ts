import type { IncomingMessage, ServerResponse } from 'node:http';

type Bucket = { count: number; resetAt: number };

const windowMs = 60_000;
const maxBuckets = 10_000;
const buckets = new Map<string, Bucket>();

const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}, windowMs);
cleanup.unref();

export function rateLimit(request: IncomingMessage, response: ServerResponse, next: () => void) {
  const path = request.url?.split('?')[0] ?? '';
  const method = request.method ?? 'GET';
  if (path === '/api/health') {
    next();
    return;
  }

  const group =
    method === 'POST' && /^\/api\/auth\/(?:login|register)$/.test(path)
      ? 'auth'
      : path === '/api/auth/refresh'
        ? 'refresh'
        : path.startsWith('/api/public/resumes/')
          ? 'public'
          : method === 'GET'
            ? 'read'
            : 'write';
  const limit = { auth: 5, refresh: 30, public: 60, read: 120, write: 60 }[group];
  const forwarded = request.headers['x-forwarded-for'];
  const ip =
    (typeof forwarded === 'string'
      ? forwarded.split(',')[0]?.trim()
      : request.socket.remoteAddress) ?? 'unknown';
  const key = `${group}:${ip}`;
  const now = Date.now();
  const previous = buckets.get(key);
  if (!previous && buckets.size >= maxBuckets) {
    const oldest = buckets.keys().next().value;
    if (oldest) {
      buckets.delete(oldest);
    }
  }
  const bucket =
    previous && previous.resetAt > now ? previous : { count: 0, resetAt: now + windowMs };
  bucket.count += 1;
  buckets.set(key, bucket);

  if (bucket.count > limit) {
    response.statusCode = 429;
    response.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(JSON.stringify({ statusCode: 429, message: 'Слишком много запросов' }));
    return;
  }

  next();
}
