import type { RawResume } from '@/src/types/raw-resume';
import { NotImplemented } from '@/src/core/errors';

/**
 * Layer 1 — Parser. Turns an uploaded resume file into a {@link RawResume}.
 * Format-specific (docx first, pdf later). Pure: no chrome.* / DOM access.
 */
export function parse(_file: File): Promise<RawResume> {
  throw new NotImplemented('parser.parse (docx parsing lands in Stage 2)');
}
