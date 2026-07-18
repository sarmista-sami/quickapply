import { describe, it, expect, vi } from 'vitest';

// Mock mammoth so the test needs no real docx binary.
vi.mock('mammoth', () => ({
  default: {
    extractRawText: vi.fn(async () => ({ value: 'Ada Lovelace\nada@example.com', messages: [] })),
  },
}));

import { extractDocxText, isDocx } from '@/src/parsers/docx/extract';

describe('extractDocxText', () => {
  it('returns plain text from a docx buffer', async () => {
    const text = await extractDocxText(new ArrayBuffer(8));
    expect(text).toContain('ada@example.com');
  });
});

describe('isDocx', () => {
  it('accepts .docx by extension', () => {
    expect(isDocx(new File([''], 'resume.docx'))).toBe(true);
  });

  it('accepts the docx mime type', () => {
    const f = new File([''], 'resume', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    expect(isDocx(f)).toBe(true);
  });

  it('rejects non-docx', () => {
    expect(isDocx(new File([''], 'resume.pdf'))).toBe(false);
    expect(isDocx(new File([''], 'resume.txt', { type: 'text/plain' }))).toBe(false);
  });
});
