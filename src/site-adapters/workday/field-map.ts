import type { ApplicantData } from '@/src/types/applicant-data';

/**
 * Declarative, typed Workday field map, keyed on tenant-agnostic `data-automation-id`s
 * captured from real postings (see docs/workday-dom-reference.md). Each entry declares a
 * `kind` and how to derive its value(s) from the model. The adapter fills only fields
 * present on the page, so one map serves every step without branching.
 *
 * Never mapped: passwords, the beecatcher honeypot, and EEO / Voluntary-Disclosure fields.
 */
export type FieldKind = 'text' | 'textarea' | 'checkbox' | 'dropdown' | 'multiselect' | 'date';

export interface WorkdayField {
  label: string;
  /** Workday `formField-*` wrapper automation-id. */
  wrapperId: string;
  kind: FieldKind;
  /** String value (text, textarea, dropdown, date). */
  get?: (data: ApplicantData) => string | undefined;
  /** Boolean value (checkbox). */
  getBool?: (data: ApplicantData) => boolean | undefined;
  /** List value (multiselect). */
  getList?: (data: ApplicantData) => string[];
  /** Optional cleanup for string values. */
  transform?: (value: string) => string;
}

const digitsOnly = (v: string) => v.replace(/\D/g, '');
const linkOf = (d: ApplicantData, kinds: string[]) =>
  d.links.find((l) => kinds.some((k) => new RegExp(k, 'i').test(l.url) || l.label.toLowerCase() === k))?.url;

export const WORKDAY_FIELDS: WorkdayField[] = [
  // Account / sign-in page.
  { label: 'Email', wrapperId: 'formField-email', kind: 'text', get: (d) => d.contact.email },
  // My Information.
  { label: 'First name', wrapperId: 'formField-legalName--firstName', kind: 'text', get: (d) => d.contact.firstName },
  { label: 'Last name', wrapperId: 'formField-legalName--lastName', kind: 'text', get: (d) => d.contact.lastName },
  { label: 'Phone', wrapperId: 'formField-phoneNumber', kind: 'text', get: (d) => d.contact.phone, transform: digitsOnly },
  { label: 'Address line 1', wrapperId: 'formField-addressLine1', kind: 'text', get: (d) => d.contact.address?.line1 ?? d.contact.location },
  { label: 'City', wrapperId: 'formField-city', kind: 'text', get: (d) => d.contact.address?.city },
  { label: 'Postal code', wrapperId: 'formField-postalCode', kind: 'text', get: (d) => d.contact.address?.postalCode },
  { label: 'Country', wrapperId: 'formField-country', kind: 'dropdown', get: (d) => d.contact.address?.country },
  // My Experience — first work entry (repeatable entries handled in a later increment).
  { label: 'Job title', wrapperId: 'formField-jobTitle', kind: 'text', get: (d) => d.work[0]?.title },
  { label: 'Company', wrapperId: 'formField-companyName', kind: 'text', get: (d) => d.work[0]?.company },
  {
    label: 'Role description',
    wrapperId: 'formField-roleDescription',
    kind: 'textarea',
    get: (d) => (d.work[0]?.bullets.length ? d.work[0]!.bullets.join('\n') : undefined),
  },
  { label: 'Currently work here', wrapperId: 'formField-currentlyWorkHere', kind: 'checkbox', getBool: (d) => d.work[0]?.current },
  { label: 'Start date', wrapperId: 'formField-startDate', kind: 'date', get: (d) => d.work[0]?.startDate },
  { label: 'End date', wrapperId: 'formField-endDate', kind: 'date', get: (d) => (d.work[0]?.current ? undefined : d.work[0]?.endDate) },
  { label: 'Degree', wrapperId: 'formField-degree', kind: 'dropdown', get: (d) => d.education[0]?.degree },
  { label: 'Skills', wrapperId: 'formField-skills', kind: 'multiselect', getList: (d) => d.skills },
  // My Experience — links.
  { label: 'LinkedIn', wrapperId: 'formField-linkedInAccount', kind: 'text', get: (d) => linkOf(d, ['linkedin']) },
  { label: 'Website', wrapperId: 'formField-url', kind: 'text', get: (d) => linkOf(d, ['github', 'other']) },
];

export function wrapperSelector(field: WorkdayField): string {
  return `[data-automation-id="${field.wrapperId}"]`;
}

/** Selector for a text/textarea/checkbox field's inner control. */
export function controlSelector(field: WorkdayField): string {
  if (field.kind === 'textarea') return `${wrapperSelector(field)} textarea`;
  if (field.kind === 'checkbox') return `${wrapperSelector(field)} input[type="checkbox"]`;
  return `${wrapperSelector(field)} input`;
}

export interface ResolvedField {
  field: WorkdayField;
  /** Wrapper selector; each strategy locates its control within. */
  selector: string;
  /** Preview/display string. */
  value: string;
  /** Multiselect values. */
  values?: string[];
  /** Checkbox desired state. */
  checked?: boolean;
}

/** Fields with a non-empty source value, resolved to their fill payload. */
export function resolveFields(data: ApplicantData): ResolvedField[] {
  const out: ResolvedField[] = [];
  for (const field of WORKDAY_FIELDS) {
    const selector = wrapperSelector(field);
    if (field.kind === 'checkbox') {
      const checked = field.getBool?.(data);
      if (checked !== undefined) out.push({ field, selector, value: checked ? 'Yes' : 'No', checked });
    } else if (field.kind === 'multiselect') {
      const values = (field.getList?.(data) ?? []).map((v) => v.trim()).filter(Boolean);
      if (values.length) out.push({ field, selector, value: values.join(', '), values });
    } else {
      const raw = field.get?.(data)?.trim();
      if (!raw) continue;
      const value = field.transform ? field.transform(raw) : raw;
      if (value) out.push({ field, selector, value });
    }
  }
  return out;
}
