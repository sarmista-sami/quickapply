import type { SiteAdapter, FieldFill, FillResult, FillStrategy } from '@/src/core/site-adapter/types';
import type { ApplicantData } from '@/src/types/applicant-data';
import { resolveFields, controlSelector, type FieldKind, type ResolvedField } from '@/src/site-adapters/workday/field-map';
import { findInput, readValue } from '@/src/site-adapters/workday/dom';
import {
  fillText,
  setCheckbox,
  selectDropdown,
  selectMultiple,
  setDate,
} from '@/src/site-adapters/workday/interactions';

const WORKDAY_HOST = /(^|\.)(myworkdayjobs|myworkday)\.com$/i;

const STRATEGY: Record<FieldKind, FillStrategy> = {
  text: 'native-setter',
  textarea: 'textarea',
  checkbox: 'checkbox',
  dropdown: 'dropdown',
  multiselect: 'multiselect',
  date: 'date',
};

/**
 * Edge adapter for Workday application forms. `matches` is pure; `plan`/`fill` touch the
 * DOM (edge only). Supports text/textarea (native setter), checkboxes, custom dropdowns,
 * multiselects, and date pickers. Has NO submit path — never advances or submits.
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
    for (const resolved of resolveFields(data)) {
      if (!document.querySelector(resolved.selector)) continue; // field not on this page/step
      fills.push({
        label: resolved.field.label,
        selector: resolved.selector,
        value: resolved.value,
        values: resolved.values,
        currentValue: currentValueOf(resolved),
        strategy: STRATEGY[resolved.field.kind],
      });
    }
    return fills;
  }

  /** Dispatch each planned fill to its strategy. No submit. One failure never aborts. */
  async fill(plan: FieldFill[]): Promise<FillResult> {
    const result: FillResult = { filled: 0, skipped: 0, errors: [] };
    for (const fill of plan) {
      try {
        const ok = await this.apply(fill, result);
        if (ok) result.filled += 1;
        else {
          result.skipped += 1;
          result.errors.push(`Could not fill: ${fill.label}`);
        }
      } catch (err) {
        result.skipped += 1;
        result.errors.push(`${fill.label}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    return result;
  }

  private async apply(fill: FieldFill, result: FillResult): Promise<boolean> {
    switch (fill.strategy) {
      case 'textarea':
        return fillText(fill.selector, fill.value, 'textarea');
      case 'checkbox':
        return setCheckbox(fill.selector, fill.value === 'Yes');
      case 'dropdown':
        return selectDropdown(fill.selector, fill.value);
      case 'multiselect': {
        const { added, skipped } = await selectMultiple(fill.selector, fill.values ?? []);
        if (skipped.length) result.errors.push(`${fill.label}: no option for ${skipped.join(', ')}`);
        return added > 0;
      }
      case 'date':
        return setDate(fill.selector, fill.value);
      case 'native-setter':
      default:
        return fillText(fill.selector, fill.value, 'input');
    }
  }
}

/** Placeholder-ish dropdown captions that mean "nothing selected yet". */
const DROPDOWN_PLACEHOLDER = /^(select( one)?)?$/i;

/**
 * Read the field's current value, returning `''` (not undefined) when the control exists
 * but is empty. The empty-only autofill relies on this: a filled field of ANY kind must
 * report a non-empty value or the MutationObserver pass would re-fill it forever.
 */
function currentValueOf(resolved: ResolvedField): string | undefined {
  const { field, selector } = resolved;
  if (field.kind === 'text' || field.kind === 'textarea') {
    const el = findInput(controlSelector(field));
    return el ? readValue(el) : undefined;
  }
  if (field.kind === 'checkbox') {
    const el = document.querySelector<HTMLInputElement>(controlSelector(field));
    return el ? (el.checked ? 'Yes' : 'No') : undefined;
  }
  if (field.kind === 'dropdown') {
    const button = document.querySelector<HTMLElement>(`${selector} button`);
    if (!button) return undefined;
    const text = (button.textContent ?? '').trim();
    return DROPDOWN_PLACEHOLDER.test(text) ? '' : text;
  }
  if (field.kind === 'multiselect') {
    const chips = Array.from(
      document.querySelectorAll<HTMLElement>(`${selector} [data-automation-id="selectedItem"]`),
    );
    return chips.map((c) => (c.textContent ?? '').trim()).filter(Boolean).join(', ');
  }
  if (field.kind === 'date') {
    const year = document.querySelector<HTMLInputElement>(
      `${selector} [data-automation-id="dateSectionYear-input"]`,
    );
    return year ? year.value.trim() : undefined;
  }
  return undefined;
}
