/**
 * Password hashing utilities using Web Crypto PBKDF2-SHA256.
 *
 * Stored format: `pbkdf2$<iterations>$<base64salt>$<base64hash>`
 *
 * Legacy fallback: if a stored value does not begin with `pbkdf2$` it is
 * treated as plaintext (demo seed data / old Firestore records) and compared
 * via plain equality.
 */

const PBKDF2_ITERATIONS = 100_000;
const SALT_LENGTH_BYTES = 16;
const HASH_LENGTH_BITS = 256; // 32 bytes
const ALGO_PREFIX = 'pbkdf2';

function getCrypto(): Crypto {
  // Browser exposes `crypto` globally; fall back to window for older typings.
  const c = (typeof crypto !== 'undefined' ? crypto : (globalThis as any).crypto) as Crypto | undefined;
  if (!c || !c.subtle) {
    throw new Error('Web Crypto API is not available in this environment');
  }
  return c;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

async function deriveHash(
  plain: string,
  salt: Uint8Array,
  iterations: number,
  hashLengthBits: number
): Promise<Uint8Array> {
  const c = getCrypto();
  const enc = new TextEncoder();
  const keyMaterial = await c.subtle.importKey(
    'raw',
    enc.encode(plain),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const bits = await c.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    hashLengthBits
  );
  return new Uint8Array(bits);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export async function hashPassword(plain: string): Promise<string> {
  const c = getCrypto();
  const salt = new Uint8Array(SALT_LENGTH_BYTES);
  c.getRandomValues(salt);
  const hash = await deriveHash(plain, salt, PBKDF2_ITERATIONS, HASH_LENGTH_BITS);
  return `${ALGO_PREFIX}$${PBKDF2_ITERATIONS}$${bytesToBase64(salt)}$${bytesToBase64(hash)}`;
}

export async function verifyPassword(
  plain: string,
  stored: string | null | undefined
): Promise<boolean> {
  if (stored == null) return false;

  // Legacy plaintext fallback (demo seed / old Firestore rows).
  if (!stored.startsWith(`${ALGO_PREFIX}$`)) {
    return plain === stored;
  }

  const parts = stored.split('$');
  if (parts.length !== 4) return false;
  const [, iterStr, saltB64, hashB64] = parts;
  const iterations = parseInt(iterStr, 10);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;

  let salt: Uint8Array;
  let expected: Uint8Array;
  try {
    salt = base64ToBytes(saltB64);
    expected = base64ToBytes(hashB64);
  } catch {
    return false;
  }

  const actual = await deriveHash(plain, salt, iterations, expected.length * 8);
  return constantTimeEqual(actual, expected);
}
