import { existsSync, mkdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const CACHE_DIR = join(process.cwd(), "tmp", "pdf-cache");

// Ensure cache directory exists on startup
if (!existsSync(CACHE_DIR)) {
  mkdirSync(CACHE_DIR, { recursive: true });
}

export interface CacheEntry {
  hit: boolean;
  data?: Buffer;
}

/**
 * Generates a safe filesystem key from a cache identifier.
 */
function getCachePath(key: string): string {
  const safe = key.replace(/[^a-z0-9_-]/gi, "_");
  return join(CACHE_DIR, `${safe}.pdf`);
}

/**
 * Read a PDF from cache if it is newer than `ifNewerThan` timestamp (ms).
 * Returns { hit: true, data } on cache HIT, or { hit: false } on MISS.
 */
export function readCache(key: string, ifNewerThan?: number): CacheEntry {
  const path = getCachePath(key);

  if (!existsSync(path)) return { hit: false };

  if (ifNewerThan !== undefined) {
    const mtime = statSync(path).mtimeMs;
    if (mtime < ifNewerThan) {
      // stale
      return { hit: false };
    }
  }

  const data = readFileSync(path);
  return { hit: true, data };
}

/**
 * Write a PDF Buffer to the cache under the given key.
 */
export function writeCache(key: string, data: Buffer): void {
  const path = getCachePath(key);
  writeFileSync(path, data);
}

/**
 * Returns the modification time (ms) of a cached file, or undefined if missing.
 */
export function getCacheMtime(key: string): number | undefined {
  const path = getCachePath(key);
  if (!existsSync(path)) return undefined;
  return statSync(path).mtimeMs;
}
