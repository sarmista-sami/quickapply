import { describe, it, expect, vi } from 'vitest';

// Mock pdfjs so the test needs no real PDF/worker.
vi.mock('pdfjs-dist', () => {
  const page = {
    getTextContent: async () => ({ items: [{ str: 'Ada Lovelace' }, { str: 'ada@example.com' }, { marked: true }] }),
  };
  return {
    GlobalWorkerOptions: { workerSrc: '' },
    getDocument: () => ({ promise: Promise.resolve({ numPages: 2, getPage: async () => page }) }),
  };
});

import { extractPdfText, isPdf, configureWorker } from '@/src/parsers/pdf/extract';

describe('extractPdfText', () => {
  it('concatenates text items across pages, ignoring non-text items', async () => {
    const text = await extractPdfText(new ArrayBuffer(8));
    expect(text).toContain('Ada Lovelace');
    expect(text).toContain('ada@example.com');
    expect(text.split('\n')).toHaveLength(2); // two pages
  });
});

describe('isPdf', () => {
  it('accepts .pdf by extension and mime, rejects others', () => {
    expect(isPdf(new File([''], 'resume.pdf'))).toBe(true);
    expect(isPdf(new File([''], 'resume', { type: 'application/pdf' }))).toBe(true);
    expect(isPdf(new File([''], 'resume.docx'))).toBe(false);
  });
});

describe('configureWorker', () => {
  it('does not throw', () => {
    expect(() => configureWorker('worker.js')).not.toThrow();
  });
});
