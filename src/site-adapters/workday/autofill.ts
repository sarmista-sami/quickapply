import type { SiteAdapter, FillResult } from '@/src/core/site-adapter/types';
import type { ApplicantData } from '@/src/types/applicant-data';

/**
 * Fill only the mapped fields that are currently empty — never overwriting user input.
 * Idempotent: once filled, a field's `currentValue` is non-empty and is skipped on the
 * next pass, so repeated calls (e.g. from a MutationObserver) neither clobber nor loop.
 *
 * `attempted` (optional, caller-owned) records `selector::value` keys that have already
 * been tried, so a field whose value has no matching option is attempted once per
 * page/step instead of on every mutation. The caller resets the set on SPA navigation.
 */
export async function autofillEmpty(
  adapter: SiteAdapter,
  data: ApplicantData,
  attempted?: Set<string>,
): Promise<FillResult> {
  // Reveal repeatable sections (e.g. click Education "Add") so their fields exist to fill.
  await adapter.prepare?.(data);
  const empty = adapter.plan(data).filter((f) => {
    if (f.currentValue) return false;
    const key = `${f.selector}::${f.value}`;
    if (attempted?.has(key)) return false;
    attempted?.add(key);
    return true;
  });
  if (empty.length === 0) return { filled: 0, skipped: 0, errors: [] };
  return adapter.fill(empty);
}
