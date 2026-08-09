/**
 * Waits out the remainder of `minMs` since `startTime`, if any time is
 * left. Used to give loading skeletons a guaranteed minimum visible
 * duration even when the underlying data fetch (local SQLite, typically
 * a few milliseconds) finishes far faster than that. Purely a visual
 * polish choice -- it adds a small artificial delay in exchange for the
 * loading state actually being perceivable.
 */
export async function ensureMinimumElapsed(startTime: number, minMs: number = 400): Promise<void> {
  const elapsed = Date.now() - startTime;
  const remaining = minMs - elapsed;
  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }
}
