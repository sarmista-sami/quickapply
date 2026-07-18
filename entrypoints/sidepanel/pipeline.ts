import { parse } from '@/src/core/parser';
import { normalize } from '@/src/core/normalizer';
import type { ApplicantData } from '@/src/types/applicant-data';

export class UnsupportedFormatError extends Error {
  constructor() {
    super('Unsupported format — please upload a .docx file.');
    this.name = 'UnsupportedFormatError';
  }
}

/**
 * Edge pipeline wiring the layers: File → docx text → parse → normalize.
 * Returns best-effort {@link ApplicantData} (may be schema-invalid where the résumé
 * omitted required fields); the preview validates and the user completes it.
 *
 * mammoth (~700 kB) is loaded lazily so it stays out of the side panel's initial
 * bundle and is only fetched when the user actually picks a file.
 */
export async function parseResumeFile(file: File): Promise<ApplicantData> {
  const { isDocx, extractDocxText } = await import('@/src/parsers/docx/extract');
  if (!isDocx(file)) throw new UnsupportedFormatError();
  const buffer = await file.arrayBuffer();
  const text = await extractDocxText(buffer);
  const raw = parse(text, { sourceName: file.name, format: 'docx' });
  return normalize(raw);
}
