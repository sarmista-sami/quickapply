import * as pdfjs from 'pdfjs-dist';

/**
 * Edge module: extract plain text from a PDF résumé using pdf.js. Lives outside `src/core`
 * (browser dependency). The worker is configured by the browser pipeline via
 * {@link configureWorker} so this module stays unit-testable with a mocked pdfjs.
 */

/** Point pdf.js at its bundled worker (called once, from the browser pipeline). */
export function configureWorker(workerSrc: string): void {
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
}

export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => (typeof item === 'object' && item !== null && 'str' in item ? String(item.str) : ''))
      .join(' ');
    pages.push(line);
  }
  return pages.join('\n');
}

// Format sniffing lives in the light guards module (no heavy deps); re-exported here
// for convenience/compatibility.
export { isPdf } from '@/src/parsers/guards';
