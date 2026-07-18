import type { ApplicantData } from '@/src/types/applicant-data';

/**
 * Layer 3 — storage port. The core depends on this interface, not on chrome.*,
 * so it stays browser-agnostic and unit-testable. Concrete adapters (e.g. the
 * chrome.storage.sync-backed one) live at the edge and inject this in.
 */
export interface StoragePort {
  load(): Promise<ApplicantData | null>;
  save(data: ApplicantData): Promise<void>;
  /** Remove all persisted applicant data. */
  clear(): Promise<void>;
}
