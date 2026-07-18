import { describe, it, expect } from 'vitest';
import { resolveFields, selectorFor, WORKDAY_TEXT_FIELDS } from '@/src/site-adapters/workday/field-map';
import type { ApplicantData } from '@/src/types/applicant-data';

const base: ApplicantData = {
  contact: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', phone: '+31 6 1234 5678', location: 'Amsterdam' },
  work: [],
  education: [],
  skills: [],
  links: [],
  extra: {},
};

describe('resolveFields', () => {
  it('resolves present text fields to selector + value', () => {
    const resolved = resolveFields(base);
    const byLabel = Object.fromEntries(resolved.map((r) => [r.field.label, r]));
    expect(byLabel['First name']?.value).toBe('Ada');
    expect(byLabel['First name']?.selector).toBe('[data-automation-id="formField-legalName--firstName"] input');
    expect(byLabel['Phone']?.value).toBe('31612345678'); // digits only
    expect(byLabel['Address']?.value).toBe('Amsterdam');
    expect(byLabel['Email']?.value).toBe('ada@example.com');
    expect(byLabel['Email']?.selector).toBe('[data-automation-id="formField-email"] input');
  });

  it('omits fields whose source value is empty', () => {
    const resolved = resolveFields({ ...base, contact: { ...base.contact, phone: undefined, location: undefined } });
    const labels = resolved.map((r) => r.field.label);
    expect(labels).toContain('First name');
    expect(labels).not.toContain('Phone');
    expect(labels).not.toContain('Address');
  });
});

describe('resolveFields — My Experience', () => {
  const withExperience: ApplicantData = {
    ...base,
    work: [{ company: 'Analytical Engines', title: 'Mathematician', startDate: '1842', current: true, bullets: ['Wrote the first algorithm', 'Designed the engine'] }],
    links: [
      { label: 'linkedin', url: 'https://linkedin.com/in/ada' },
      { label: 'github', url: 'https://github.com/ada' },
    ],
  };
  const byLabel = Object.fromEntries(resolveFields(withExperience).map((r) => [r.field.label, r]));

  it('maps first work entry text fields', () => {
    expect(byLabel['Job title']?.value).toBe('Mathematician');
    expect(byLabel['Company']?.value).toBe('Analytical Engines');
    expect(byLabel['Role description']?.value).toBe('Wrote the first algorithm\nDesigned the engine');
  });

  it('role description targets a textarea', () => {
    expect(byLabel['Role description']?.selector).toBe('[data-automation-id="formField-roleDescription"] textarea');
  });

  it('maps linkedin and website links', () => {
    expect(byLabel['LinkedIn']?.value).toBe('https://linkedin.com/in/ada');
    expect(byLabel['Website']?.value).toBe('https://github.com/ada');
  });
});

describe('selectorFor', () => {
  it('targets the inner input of the formField wrapper', () => {
    const firstName = WORKDAY_TEXT_FIELDS.find((f) => f.label === 'First name')!;
    expect(selectorFor(firstName)).toBe('[data-automation-id="formField-legalName--firstName"] input');
  });
});
