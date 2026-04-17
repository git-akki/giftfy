import { createHash, randomBytes } from 'crypto';

export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export function generateApiKey(): { key: string; hash: string; hint: string } {
  const raw = randomBytes(32).toString('base64url');
  const key = `pk_live_${raw}`;
  return { key, hash: sha256(key), hint: key.slice(-4) };
}

export function generateSessionToken(): string {
  return `sk_sess_${randomBytes(32).toString('base64url')}`;
}

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
