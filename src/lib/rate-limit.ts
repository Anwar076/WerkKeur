type Entry = {
  count: number;
  resetAt: number;
};

const bucket = new Map<string, Entry>();

export function assertRateLimit(
  key: string,
  { maxRequests, windowMs }: { maxRequests: number; windowMs: number },
) {
  const now = Date.now();
  const current = bucket.get(key);

  if (!current || current.resetAt < now) {
    bucket.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (current.count >= maxRequests) {
    throw new Error("Te veel verzoeken. Probeer het later opnieuw.");
  }

  current.count += 1;
  bucket.set(key, current);
}
