import { parse } from '@/src/core/parser';
import { normalize } from '@/src/core/normalizer';
import type { ApplicantData } from '@/src/types/applicant-data';

export class UnsupportedFormatError extends Error {
  constructor() {
    super('Unsupported format — please upload a .docx or .pdf file.');
    this.name = 'UnsupportedFormatError';
  }
}

/**
 * Edge pipeline wiring the layers: File → text → parse → normalize.
 * Returns best-effort {@link ApplicantData} (may be schema-invalid where the résumé
 * omitted required fields); the preview validates and the user completes it.
 *
 * The docx (mammoth) and pdf (pdf.js) extractors are heavy, so they're loaded lazily —
 * only the one matching the picked file is fetched, keeping the initial bundle small.
 */
export async function parseResumeFile(file: File): Promise<ApplicantData> {
  const format = await extractText(file);
  const raw = parse(format.text, { sourceName: file.name, format: format.kind });
  return normalize(raw);
}

async function extractText(file: File): Promise<{ text: string; kind: 'docx' | 'pdf' }> {
  // Sniff the format with the light guards first, so only the matching heavy extractor
  // chunk (mammoth or pdf.js) is ever fetched.
  const { isDocx, isPdf } = await import('@/src/parsers/guards');

  if (isDocx(file)) {
    const { extractDocxText } = await import('@/src/parsers/docx/extract');
    return { text: await extractDocxText(await file.arrayBuffer()), kind: 'docx' };
  }

  if (isPdf(file)) {
    const pdf = await import('@/src/parsers/pdf/extract');
    // Configure the bundled pdf.js worker before extracting (browser only).
    const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
    pdf.configureWorker(workerUrl);
    return { text: await pdf.extractPdfText(await file.arrayBuffer()), kind: 'pdf' };
  }

  throw new UnsupportedFormatError();
}
