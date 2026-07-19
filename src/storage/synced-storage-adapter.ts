import type { StoragePort } from '@/src/core/applicant-data/storage-port';
import type { ApplicantData } from '@/src/types/applicant-data';
import { LocalStorageAdapter } from '@/src/storage/local-storage-adapter';

// The full model roams. chrome.storage.sync caps each item at ~8 KB, so the serialized
// data is split into character chunks that each stay well under the limit, written as
// `applicant_0`, `applicant_1`, … with an `applicant_meta` count. Total is still bounded
// by sync's ~100 KB quota; if a write exceeds it, local keeps the data and we warn.
const META_KEY = 'applicant_meta';
const CHUNK_PREFIX = 'applicant_';
// Sync's QUOTA_BYTES_PER_ITEM (~8 KB) counts the JSON-serialized value; escaping (quotes,
// backslashes, non-ASCII) can inflate a chunk well past its char count, so keep headroom.
const CHUNK_SIZE = 3500;

interface ChunkMeta {
  count: number;
}

function chunkKeys(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `${CHUNK_PREFIX}${i}`);
}

function splitChunks(text: string): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
}

export interface SyncedStorageOptions {
  /** Called with a non-fatal message when the sync write fails (e.g. quota). */
  onWarning?: (message: string) => void;
}

/**
 * Edge adapter implementing the core {@link StoragePort}. Roams the FULL
 * {@link ApplicantData} via `chrome.storage.sync` (the signed-in Google account),
 * chunked to beat the per-item byte cap, and mirrors it to `chrome.storage.local` for
 * offline/fallback reads. Load prefers sync; falls back to local. Lives outside
 * `src/core` (touches `chrome.*`).
 */
export class SyncedStorageAdapter implements StoragePort {
  private readonly local = new LocalStorageAdapter();
  private readonly onWarning?: (message: string) => void;

  constructor(options: SyncedStorageOptions = {}) {
    this.onWarning = options.onWarning;
  }

  async save(data: ApplicantData): Promise<void> {
    // Local mirror is the offline source of truth; write it first so data is never lost.
    await this.local.save(data);

    const chunks = splitChunks(JSON.stringify(data));
    const items: Record<string, unknown> = { [META_KEY]: { count: chunks.length } satisfies ChunkMeta };
    chunks.forEach((chunk, i) => (items[`${CHUNK_PREFIX}${i}`] = chunk));

    try {
      await this.clearStaleChunks(chunks.length);
      await chrome.storage.sync.set(items);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      this.onWarning?.(`Saved on this device, but could not sync your details: ${reason}`);
    }
  }

  async load(): Promise<ApplicantData | null> {
    const fromSync = await this.loadFromSync();
    if (fromSync) return fromSync;
    return this.local.load();
  }

  async clear(): Promise<void> {
    const meta = (await chrome.storage.sync.get(META_KEY))[META_KEY] as ChunkMeta | undefined;
    const keys = [META_KEY, ...chunkKeys(meta?.count ?? 0)];
    await chrome.storage.sync.remove(keys);
    await this.local.clear();
  }

  private async loadFromSync(): Promise<ApplicantData | null> {
    const meta = (await chrome.storage.sync.get(META_KEY))[META_KEY] as ChunkMeta | undefined;
    if (!meta || meta.count <= 0) return null;

    const keys = chunkKeys(meta.count);
    const stored = await chrome.storage.sync.get(keys);
    const json = keys.map((k) => (stored[k] as string | undefined) ?? '').join('');
    try {
      return JSON.parse(json) as ApplicantData;
    } catch {
      return null; // corrupt/partial sync state — fall back to local
    }
  }

  /** Remove chunk items from a previous, longer save so no stale tail remains. */
  private async clearStaleChunks(newCount: number): Promise<void> {
    const meta = (await chrome.storage.sync.get(META_KEY))[META_KEY] as ChunkMeta | undefined;
    const oldCount = meta?.count ?? 0;
    if (oldCount > newCount) {
      const stale = Array.from({ length: oldCount - newCount }, (_, i) => `${CHUNK_PREFIX}${newCount + i}`);
      await chrome.storage.sync.remove(stale);
    }
  }
}
