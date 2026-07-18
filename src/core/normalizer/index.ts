import type { RawResume } from '@/src/types/raw-resume';
import type { ApplicantData } from '@/src/types/applicant-data';
import { NotImplemented } from '@/src/core/errors';

/**
 * Layer 2 — Normalizer. Maps format-specific {@link RawResume} to the
 * website-agnostic {@link ApplicantData} model. Pure: no chrome.* / DOM access.
 */
export function normalize(_raw: RawResume): ApplicantData {
  throw new NotImplemented('normalizer.normalize (Stage 2)');
}
