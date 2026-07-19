import mammoth from 'mammoth';

/**
 * Edge module: extract plain text from a docx file. Lives outside `src/core` because
 * mammoth is a browser/document-oriented dependency — the core parser only ever sees
 * the returned string (AGENTS.md rule 2).
 */
export async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
  return value;
}

// Format sniffing lives in the light guards module (no heavy deps); re-exported here
// for convenience/compatibility.
export { isDocx } from '@/src/parsers/guards';
