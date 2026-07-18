import type { StoragePort } from '@/src/core/applicant-data/storage-port';
import type { ApplicantData } from '@/src/types/applicant-data';

const KEY = 'applicantData';

/**
 * Edge adapter implementing the core {@link StoragePort} over `chrome.storage.local`.
 * Stopgap for Stage 2 — Stage 3 swaps in a `chrome.storage.sync`-backed adapter behind
 * the same interface, so panel code that depends on `StoragePort` needs no change.
 */
export class LocalStorageAdapter implements StoragePort {
  async load(): Promise<ApplicantData | null> {
    const result = await chrome.storage.local.get(KEY);
    return (result[KEY] as ApplicantData | undefined) ?? null;
  }

  async save(data: ApplicantData): Promise<void> {
    await chrome.storage.local.set({ [KEY]: data });
  }
}
