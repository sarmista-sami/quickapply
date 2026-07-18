import type { ApplicantData } from '@/src/types/applicant-data';

/**
 * Declarative Workday text-field map, keyed on the tenant-agnostic
 * `data-automation-id`s captured from real Workday "My Information" pages
 * (see e2e/capture/workday-automation-ids.json). Each field's `<input>` lives inside a
 * `formField-*` wrapper div, so the selector targets the descendant input.
 *
 * 4a covers text inputs only. Country / phone-type / source are custom dropdowns
 * (button + search) handled in a later increment. Email lives on the account/sign-in
 * page (`formField-email`), not My Info; the adapter fills whichever mapped fields are
 * present, so the same map serves both pages with no branching.
 */
export interface WorkdayTextField {
  label: string;
  /** Workday `formField-*` wrapper automation-id. */
  wrapperId: string;
  /** Inner control tag (Workday uses `textarea` for long text like role description). */
  control?: 'input' | 'textarea';
  /** Reads the source value from the normalized model. */
  get: (data: ApplicantData) => string | undefined;
  /** Optional cleanup applied to the read value before filling. */
  transform?: (value: string) => string;
}

// Workday's phoneNumber field wants digits only (country code lives in a separate
// dropdown, handled in a later increment). Strip formatting to avoid a validation error.
const digitsOnly = (v: string) => v.replace(/\D/g, '');
const linkOf = (d: ApplicantData, kinds: string[]) =>
  d.links.find((l) => kinds.some((k) => new RegExp(k, 'i').test(l.url) || l.label.toLowerCase() === k))?.url;

export const WORKDAY_TEXT_FIELDS: WorkdayTextField[] = [
  // Account / sign-in page.
  { label: 'Email', wrapperId: 'formField-email', get: (d) => d.contact.email },
  // My Information page.
  { label: 'First name', wrapperId: 'formField-legalName--firstName', get: (d) => d.contact.firstName },
  { label: 'Last name', wrapperId: 'formField-legalName--lastName', get: (d) => d.contact.lastName },
  { label: 'Phone', wrapperId: 'formField-phoneNumber', get: (d) => d.contact.phone, transform: digitsOnly },
  { label: 'Address', wrapperId: 'formField-addressLine1', get: (d) => d.contact.location },
  // My Experience page — first work entry (repeatable entries handled in a later increment).
  { label: 'Job title', wrapperId: 'formField-jobTitle', get: (d) => d.work[0]?.title },
  { label: 'Company', wrapperId: 'formField-companyName', get: (d) => d.work[0]?.company },
  {
    label: 'Role description',
    wrapperId: 'formField-roleDescription',
    control: 'textarea',
    get: (d) => (d.work[0]?.bullets.length ? d.work[0]!.bullets.join('\n') : undefined),
  },
  // My Experience — links.
  { label: 'LinkedIn', wrapperId: 'formField-linkedInAccount', get: (d) => linkOf(d, ['linkedin']) },
  { label: 'Website', wrapperId: 'formField-url', get: (d) => linkOf(d, ['github', 'other']) },
];

/** CSS selector for a field's inner control. */
export function selectorFor(field: WorkdayTextField): string {
  return `[data-automation-id="${field.wrapperId}"] ${field.control ?? 'input'}`;
}

export interface ResolvedField {
  field: WorkdayTextField;
  value: string;
  selector: string;
}

/** Fields that have a non-empty source value, paired with their selector + value. */
export function resolveFields(data: ApplicantData): ResolvedField[] {
  const resolved: ResolvedField[] = [];
  for (const field of WORKDAY_TEXT_FIELDS) {
    const raw = field.get(data)?.trim();
    if (!raw) continue;
    const value = field.transform ? field.transform(raw) : raw;
    if (value) resolved.push({ field, value, selector: selectorFor(field) });
  }
  return resolved;
}
