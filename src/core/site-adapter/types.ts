import type { ApplicantData } from '@/src/types/applicant-data';

/**
 * How a value should be written into a target field. The concrete write strategy
 * (native property setter for React/Vue/etc., dropdown/date/autocomplete handling)
 * is a Stage-4 detail; the type exists now so the contract is fixed.
 */
export type FillStrategy =
  | 'native-setter'
  | 'textarea'
  | 'checkbox'
  | 'dropdown'
  | 'multiselect'
  | 'date';

export interface FieldFill {
  /** Human-readable label for the review UI. */
  label: string;
  /** Selector for the target field wrapper (strategy locates the control within). */
  selector: string;
  /** The normalized value to write, or a preview string for structured kinds. */
  value: string;
  /** For multiselect: the individual values to add. */
  values?: string[];
  /** The field's current on-page value, for a diff-style preview. */
  currentValue?: string;
  /** How to write the field. */
  strategy?: FillStrategy;
}

export interface FillResult {
  filled: number;
  skipped: number;
  errors: string[];
}

/**
 * Layer 4 — Site Adapter. Maps {@link ApplicantData} to a specific site's form.
 *
 * `plan()` computes intended writes WITHOUT touching the page (drives the
 * "show what will be filled before filling" review). `fill()` performs the writes.
 * Adapters MUST NOT auto-submit forms (AGENTS.md rule 5).
 */
export interface SiteAdapter {
  /** Whether this adapter handles the given page URL. */
  matches(url: string): boolean;
  /** Compute intended field writes without mutating the page. */
  plan(data: ApplicantData): FieldFill[];
  /** Perform the planned writes. */
  fill(plan: FieldFill[]): Promise<FillResult>;
}
