import { describe, it, expect } from 'vitest';
import { resolveFields, controlSelector, wrapperSelector, WORKDAY_FIELDS } from '@/src/site-adapters/workday/field-map';
import type { ApplicantData } from '@/src/types/applicant-data';

const base: ApplicantData = {
  contact: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', phone: '+31 6 1234 5678', location: 'Amsterdam' },
  work: [],
  education: [],
  skills: [],
  links: [],
  extra: {},
};

function byLabel(data: ApplicantData) {
  return Object.fromEntries(resolveFields(data).map((r) => [r.field.label, r]));
}

describe('resolveFields — contact/text', () => {
  const map = byLabel(base);

  it('resolves text fields with wrapper selector + value', () => {
    expect(map['First name']?.value).toBe('Ada');
    expect(map['First name']?.selector).toBe('[data-automation-id="formField-legalName--firstName"]');
    expect(map['Email']?.value).toBe('ada@example.com');
    expect(map['Phone']?.value).toBe('31612345678'); // digits only
    expect(map['Address line 1']?.value).toBe('Amsterdam'); // from freeform location fallback
  });

  it('omits fields whose source value is empty', () => {
    const m = byLabel({ ...base, contact: { ...base.contact, phone: undefined, location: undefined } });
    expect(m['First name']).toBeTruthy();
    expect(m['Phone']).toBeUndefined();
    expect(m['Address line 1']).toBeUndefined();
  });
});

describe('resolveFields — structured address', () => {
  const withAddr: ApplicantData = {
    ...base,
    contact: { ...base.contact, location: undefined, address: { line1: '1 Sesame St', city: 'Amsterdam', postalCode: '1011', country: 'Netherlands' } },
  };
  const map = byLabel(withAddr);

  it('fills address line, city, postal, and country', () => {
    expect(map['Address line 1']?.value).toBe('1 Sesame St');
    expect(map['City']?.value).toBe('Amsterdam');
    expect(map['Postal code']?.value).toBe('1011');
    expect(map['Country']?.value).toBe('Netherlands');
  });

  it('country uses the dropdown strategy (checked via kind)', () => {
    expect(map['Country']?.field.kind).toBe('dropdown');
  });

  it('address line 1 falls back to freeform location', () => {
    const m = byLabel({ ...base, contact: { ...base.contact, location: 'Fallback St', address: undefined } });
    expect(m['Address line 1']?.value).toBe('Fallback St');
  });
});

describe('resolveFields — name re-casing at fill time', () => {
  it('corrects a stale ALL-CAPS stored name', () => {
    const m = byLabel({ ...base, contact: { ...base.contact, firstName: 'PRIYADARSHINI', lastName: 'mcDONALD' } });
    expect(m['First name']?.value).toBe('Priyadarshini');
    expect(m['Last name']?.value).toBe('Mcdonald');
  });

  it('leaves already-correct casing unchanged', () => {
    const m = byLabel(base);
    expect(m['First name']?.value).toBe('Ada');
    expect(m['Last name']?.value).toBe('Lovelace');
  });
});

describe('resolveFields — national phone number', () => {
  it('strips a known country calling code', () => {
    const m = byLabel({
      ...base,
      contact: { ...base.contact, phone: '+31 6 8750 8928', address: { country: 'Netherlands' } },
    });
    expect(m['Phone']?.value).toBe('687508928');
    expect(m['Phone']?.value.startsWith('31')).toBe(false);
  });

  it('leaves digits unchanged for an unknown/unmapped country', () => {
    const m = byLabel({
      ...base,
      contact: { ...base.contact, phone: '+31 6 8750 8928', address: { country: 'Narnia' } },
    });
    expect(m['Phone']?.value).toBe('31687508928');
  });

  it('leaves digits unchanged with no country at all', () => {
    const m = byLabel({ ...base, contact: { ...base.contact, phone: '+31 6 8750 8928' } });
    expect(m['Phone']?.value).toBe('31687508928');
  });
});

describe('resolveFields — rich kinds', () => {
  const rich: ApplicantData = {
    ...base,
    work: [{ company: 'Analytical Engines', title: 'Mathematician', startDate: '1842-06', endDate: '1852-01', current: true, bullets: ['Wrote the first algorithm'] }],
    education: [{ school: 'University of London', degree: 'Bachelor of Science' }],
    skills: ['Algorithms', 'Calculus'],
    links: [{ label: 'linkedin', url: 'https://linkedin.com/in/ada' }],
  };
  const map = byLabel(rich);

  it('checkbox resolves to a boolean + Yes/No preview', () => {
    expect(map['Currently work here']?.checked).toBe(true);
    expect(map['Currently work here']?.value).toBe('Yes');
  });

  it('dropdown resolves the degree value', () => {
    expect(map['Degree']?.value).toBe('Bachelor of Science');
  });

  it('multiselect carries the list', () => {
    expect(map['Skills']?.values).toEqual(['Algorithms', 'Calculus']);
    expect(map['Skills']?.value).toBe('Algorithms, Calculus');
  });

  it('date resolves the start date; end date omitted while current', () => {
    expect(map['Start date']?.value).toBe('1842-06');
    expect(map['End date']).toBeUndefined(); // current role → no end date
  });

  it('textarea joins bullets', () => {
    expect(map['Role description']?.value).toBe('Wrote the first algorithm');
  });
});

describe('selectors', () => {
  it('wrapperSelector targets the formField wrapper', () => {
    const first = WORKDAY_FIELDS.find((f) => f.label === 'First name')!;
    expect(wrapperSelector(first)).toBe('[data-automation-id="formField-legalName--firstName"]');
  });

  it('controlSelector picks input/textarea/checkbox by kind', () => {
    const roleDesc = WORKDAY_FIELDS.find((f) => f.label === 'Role description')!;
    const current = WORKDAY_FIELDS.find((f) => f.label === 'Currently work here')!;
    expect(controlSelector(roleDesc)).toBe('[data-automation-id="formField-roleDescription"] textarea');
    expect(controlSelector(current)).toBe('[data-automation-id="formField-currentlyWorkHere"] input[type="checkbox"]');
  });
});
