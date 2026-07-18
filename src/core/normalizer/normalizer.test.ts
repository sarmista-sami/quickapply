import { describe, it, expect } from 'vitest';
import { normalize, parseDateRange, extractDates } from '@/src/core/normalizer';
import { ApplicantDataSchema } from '@/src/types/applicant-data';
import type { RawResume } from '@/src/types/raw-resume';

const raw: RawResume = {
  sourceName: 'ada.docx',
  format: 'docx',
  fields: {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    phone: '+1 (415) 555-0198',
    links: [{ url: 'https://linkedin.com/in/ada', kind: 'linkedin' }],
  },
  sections: [
    { kind: 'work', heading: 'Experience', blocks: ['Analytical Engines — Lead Mathematician', 'Designed the first algorithm'] },
    { kind: 'education', heading: 'Education', blocks: ['University of London — Mathematics'] },
    { kind: 'skills', heading: 'Skills', blocks: ['Algorithms, Calculus, Fortran'] },
  ],
};

describe('normalize', () => {
  const data = normalize(raw);

  it('produces schema-valid ApplicantData for a complete résumé', () => {
    expect(() => ApplicantDataSchema.parse(data)).not.toThrow();
  });

  it('splits the name into first and last', () => {
    expect(data.contact.firstName).toBe('Ada');
    expect(data.contact.lastName).toBe('Lovelace');
  });

  it('maps a work entry with company/title and bullets', () => {
    expect(data.work[0]?.company).toBe('Analytical Engines');
    expect(data.work[0]?.title).toBe('Lead Mathematician');
    expect(data.work[0]?.bullets).toContain('Designed the first algorithm');
  });

  it('splits skills on commas', () => {
    expect(data.skills).toEqual(['Algorithms', 'Calculus', 'Fortran']);
  });

  it('maps links', () => {
    expect(data.links[0]).toEqual({ label: 'linkedin', url: 'https://linkedin.com/in/ada' });
  });

  it('defaults extra to empty', () => {
    expect(data.extra).toEqual({});
  });
});

describe('normalize — name capitalization', () => {
  it('title-cases ALL-CAPS name tokens, leaves mixed case', () => {
    const capsRaw = { ...raw, fields: { ...raw.fields, name: 'PRIYADARSHINI McDonald' } };
    const data = normalize(capsRaw);
    expect(data.contact.firstName).toBe('Priyadarshini');
    expect(data.contact.lastName).toBe('McDonald');
  });
});

describe('parseDateRange', () => {
  it('parses a plain year range', () => {
    expect(parseDateRange('2018 - 2020')).toEqual({ startDate: '2018', endDate: '2020', current: false });
  });

  it('parses month-year with Present as current', () => {
    expect(parseDateRange('Jan 2019 – Present')).toEqual({ startDate: '2019-01', endDate: undefined, current: true });
  });

  it('parses numeric MM/YYYY range', () => {
    expect(parseDateRange('01/2018 to 06/2020')).toEqual({ startDate: '2018-01', endDate: '2020-06', current: false });
  });

  it('returns undefined without a range', () => {
    expect(parseDateRange('Led a team of five engineers')).toBeUndefined();
    expect(parseDateRange('Shipped v2 in 2019')).toBeUndefined(); // single year, no range
  });
});

describe('extractDates', () => {
  it('normalizes month names and numeric formats', () => {
    expect(extractDates('March 2018 – 12/2020')).toEqual(['2018-03', '2020-12']);
  });
});

describe('normalize — entry dates', () => {
  it('sets work dates and current flag from a date bullet', () => {
    const data = normalize({
      sourceName: 'x.docx',
      format: 'docx',
      fields: { links: [] },
      sections: [
        { kind: 'work', heading: 'Experience', blocks: ['Acme — Engineer', 'Jan 2019 - Present', 'Built things'] },
      ],
    });
    expect(data.work[0]?.startDate).toBe('2019-01');
    expect(data.work[0]?.current).toBe(true);
    expect(data.work[0]?.bullets).toEqual(['Built things']); // pure date line dropped
  });

  it('sets education dates and field of study', () => {
    const data = normalize({
      sourceName: 'x.docx',
      format: 'docx',
      fields: { links: [] },
      sections: [
        { kind: 'education', heading: 'Education', blocks: ['MIT — BSc in Computer Science, 2012 - 2016'] },
      ],
    });
    expect(data.education[0]?.startDate).toBe('2012');
    expect(data.education[0]?.endDate).toBe('2016');
    expect(data.education[0]?.field).toBe('Computer Science');
  });
});

describe('normalize — missing fields', () => {
  it('yields empty required strings the user must fill (best-effort)', () => {
    const empty = normalize({ sourceName: 'x.docx', format: 'docx', fields: { links: [] }, sections: [] });
    expect(empty.contact.email).toBe('');
    expect(empty.work).toEqual([]);
  });
});
