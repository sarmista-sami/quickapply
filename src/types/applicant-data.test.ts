import { describe, it, expect } from 'vitest';
import { ApplicantDataSchema } from '@/src/types/applicant-data';

const valid = {
  contact: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' },
  work: [
    {
      company: 'Analytical Engines',
      title: 'Mathematician',
      startDate: '1842-01',
      current: true,
      bullets: ['Wrote the first algorithm'],
    },
  ],
  education: [],
  skills: ['algorithms'],
  links: [],
  extra: { 'workday.referralSource': 'LinkedIn' },
};

describe('ApplicantDataSchema', () => {
  it('accepts well-formed applicant data', () => {
    const parsed = ApplicantDataSchema.parse(valid);
    expect(parsed.contact.firstName).toBe('Ada');
  });

  it('rejects data missing required contact fields', () => {
    const bad = { ...valid, contact: { firstName: 'Ada' } };
    expect(() => ApplicantDataSchema.parse(bad)).toThrow();
  });

  it('round-trips extra entries', () => {
    const parsed = ApplicantDataSchema.parse(valid);
    expect(parsed.extra['workday.referralSource']).toBe('LinkedIn');
  });

  it('applies defaults for optional collections', () => {
    const parsed = ApplicantDataSchema.parse({
      contact: { firstName: 'Grace', lastName: 'Hopper', email: 'grace@example.com' },
    });
    expect(parsed.work).toEqual([]);
    expect(parsed.extra).toEqual({});
  });

  it('has no password or payment fields in the schema shape', () => {
    const keys = Object.keys(ApplicantDataSchema.shape);
    const forbidden = /password|payment|card|cvv|ssn|creditcard/i;
    expect(keys.some((k) => forbidden.test(k))).toBe(false);
  });
});
