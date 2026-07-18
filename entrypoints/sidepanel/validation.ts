import { ApplicantDataSchema, type ApplicantData } from '@/src/types/applicant-data';

export interface ValidationResult {
  valid: boolean;
  /** Errors keyed by dot-path, e.g. "contact.email", "work.0.company". */
  errors: Record<string, string>;
}

export function validateApplicant(data: ApplicantData): ValidationResult {
  const result = ApplicantDataSchema.safeParse(data);
  if (result.success) return { valid: true, errors: {} };

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.');
    if (!(key in errors)) errors[key] = issue.message;
  }
  return { valid: false, errors };
}
