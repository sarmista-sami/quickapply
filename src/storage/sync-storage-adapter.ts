import type { StoragePort } from '@/src/core/applicant-data/storage-port';
import type { ApplicantData } from '@/src/types/applicant-data';
import { NotImplemented } from '@/src/core/errors';

/**
 * Edge adapter implementing the core {@link StoragePort} over `chrome.storage.sync`
 * (small selected fields synced to the user's Google account). Lives OUTSIDE
 * `src/core` because it touches `chrome.*` — core stays browser-agnostic
 * (AGENTS.md rule 2). Real read/write logic lands in Stage 3.
 */
export class SyncStorageAdapter implements StoragePort {
  load(): Promise<ApplicantData | null> {
    throw new NotImplemented('SyncStorageAdapter.load (Stage 3)');
  }

  save(_data: ApplicantData): Promise<void> {
    throw new NotImplemented('SyncStorageAdapter.save (Stage 3)');
  }
}
