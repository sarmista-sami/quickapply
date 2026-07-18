import type { ApplicantData } from '@/src/types/applicant-data';

/**
 * How a value should be written into a target field. The concrete write strategy
 * (native property setter for React/Vue/etc., dropdown/date/autocomplete handling)
 * is a Stage-4 detail; the type exists now so the contract is fixed.
 */
export interface FieldFill {
  /** Human-readable label for the review UI. */
  label: string;
  /** Selector or locator strategy for the target element (refined in Stage 4). */
  selector: string;
  /** The normalized value to write. */
  value: string;
  /** Write strategy hint; expanded in Stage 4. */
  strategy?: 'native-setter' | 'select' | 'checkbox' | 'radio' | 'custom';
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
