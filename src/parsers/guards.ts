/**
 * Pure format sniffing, separated from the heavy extractor modules so the pipeline can
 * decide which extractor to lazy-load without pulling mammoth/pdf.js into the bundle
 * just to check a file name.
 */
const DOCX_EXT = /\.docx$/i;
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const PDF_EXT = /\.pdf$/i;

export function isDocx(file: File): boolean {
  return file.type === DOCX_MIME || DOCX_EXT.test(file.name);
}

export function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || PDF_EXT.test(file.name);
}
