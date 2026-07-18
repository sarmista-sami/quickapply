import { describe, it, expect } from 'vitest';
import { normalize } from '@/src/core/normalizer';
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

describe('normalize — missing fields', () => {
  it('yields empty required strings the user must fill (best-effort)', () => {
    const empty = normalize({ sourceName: 'x.docx', format: 'docx', fields: { links: [] }, sections: [] });
    expect(empty.contact.email).toBe('');
    expect(empty.work).toEqual([]);
  });
});
