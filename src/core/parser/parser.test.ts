import { describe, it, expect } from 'vitest';
import { parse, headingKind, detectFields } from '@/src/core/parser';

const SAMPLE = `Ada Lovelace
ada@example.com | +1 (415) 555-0198
https://linkedin.com/in/ada  github.com/ada

Experience
Analytical Engines — Lead Mathematician
Designed the first algorithm

Education
University of London — Mathematics

Skills
Algorithms, Calculus, Fortran`;

const META = { sourceName: 'ada.docx', format: 'docx' as const };

describe('parse — reliable fields', () => {
  const raw = parse(SAMPLE, META);

  it('extracts email', () => {
    expect(raw.fields.email).toBe('ada@example.com');
  });

  it('extracts a plausible phone', () => {
    expect(raw.fields.phone?.replace(/\D/g, '')).toBe('14155550198');
  });

  it('classifies linkedin and github links', () => {
    const kinds = raw.fields.links.map((l) => l.kind);
    expect(kinds).toContain('linkedin');
    expect(kinds).toContain('github');
  });

  it('guesses the name from the top line', () => {
    expect(raw.fields.name).toBe('Ada Lovelace');
  });

  it('carries provenance meta', () => {
    expect(raw.sourceName).toBe('ada.docx');
    expect(raw.format).toBe('docx');
  });
});

describe('parse — section segmentation', () => {
  const raw = parse(SAMPLE, META);

  it('detects work, education, and skills sections', () => {
    const kinds = raw.sections.map((s) => s.kind);
    expect(kinds).toContain('work');
    expect(kinds).toContain('education');
    expect(kinds).toContain('skills');
  });

  it('groups blocks under their heading', () => {
    const work = raw.sections.find((s) => s.kind === 'work');
    expect(work?.blocks.join(' ')).toContain('Analytical Engines');
  });
});

describe('headingKind', () => {
  it('matches known headings, ignores long lines', () => {
    expect(headingKind('Experience')).toBe('work');
    expect(headingKind('Education:')).toBe('education');
    expect(headingKind('Designed the first algorithm for the engine')).toBeUndefined();
  });
});

describe('detectFields — phone false positives', () => {
  it('does not treat a bare year as a phone', () => {
    const fields = detectFields(['Worked 2018 to 2020']);
    expect(fields.phone).toBeUndefined();
  });
});
