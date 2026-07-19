import type { SiteAdapter, FillResult } from '@/src/core/site-adapter/types';
import type { ApplicantData } from '@/src/types/applicant-data';

/**
 * Fill only the mapped fields that are currently empty — never overwriting user input.
 * Idempotent: once filled, a field's `currentValue` is non-empty and is skipped on the
 * next pass, so repeated calls (e.g. from a MutationObserver) neither clobber nor loop.
 */
export async function autofillEmpty(adapter: SiteAdapter, data: ApplicantData): Promise<FillResult> {
  const empty = adapter.plan(data).filter((f) => !f.currentValue);
  if (empty.length === 0) return { filled: 0, skipped: 0, errors: [] };
  return adapter.fill(empty);
}
