const KEY = 'giftfy_seen_replies';

export function getSeenIds(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function markSeen(ids: string[]): void {
  if (ids.length === 0) return;
  const seen = getSeenIds();
  for (const id of ids) seen.add(id);
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.from(seen)));
  } catch {
    // quota exceeded — ignore
  }
}
