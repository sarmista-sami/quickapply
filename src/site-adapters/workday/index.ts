import type { SiteAdapter, FieldFill, FillResult } from '@/src/core/site-adapter/types';
import type { ApplicantData } from '@/src/types/applicant-data';
import { resolveFields } from '@/src/site-adapters/workday/field-map';
import { findInput, readValue, setNativeValue, waitForField } from '@/src/site-adapters/workday/dom';

const WORKDAY_HOST = /(^|\.)(myworkdayjobs|myworkday)\.com$/i;

/**
 * Edge adapter for Workday application forms. `matches` is pure; `plan`/`fill` touch the
 * DOM (edge only, never in `src/core`). 4a covers text fields via the native-setter path.
 * The adapter has NO submit path — it never advances or submits the form (AGENTS.md rule 5).
 */
export class WorkdayAdapter implements SiteAdapter {
  matches(url: string): boolean {
    try {
      return WORKDAY_HOST.test(new URL(url).hostname);
    } catch {
      return false;
    }
  }

  /** Read-only: build the fill plan for fields present on the page. Does not mutate. */
  plan(data: ApplicantData): FieldFill[] {
    const fills: FieldFill[] = [];
    for (const { field, value, selector } of resolveFields(data)) {
      const el = findInput(selector);
      if (!el) continue; // field not on this page/step
      fills.push({
        label: field.label,
        selector,
        value,
        currentValue: readValue(el),
        strategy: 'native-setter',
      });
    }
    return fills;
  }

  /** Write each planned value via the native setter, waiting for lazy fields. No submit. */
  async fill(plan: FieldFill[]): Promise<FillResult> {
    const result: FillResult = { filled: 0, skipped: 0, errors: [] };
    for (const fill of plan) {
      const el = await waitForField(fill.selector);
      if (!el) {
        result.skipped += 1;
        result.errors.push(`Field not found: ${fill.label}`);
        continue;
      }
      try {
        setNativeValue(el, fill.value);
        result.filled += 1;
      } catch (err) {
        result.skipped += 1;
        result.errors.push(`${fill.label}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    return result;
  }
}
