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

const DOCX_EXT = /\.docx$/i;
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/** Whether a picked file looks like a docx we can extract. */
export function isDocx(file: File): boolean {
  return file.type === DOCX_MIME || DOCX_EXT.test(file.name);
}
