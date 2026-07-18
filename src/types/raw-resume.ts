/**
 * Raw, format-specific output of the parser layer (Layer 1), before normalization.
 *
 * Placeholder shape for the skeleton — the real structure is defined when docx
 * parsing lands in Stage 2. Kept deliberately loose here so the parser can evolve
 * without reshaping the normalized {@link ApplicantData} contract.
 */
export interface RawResume {
  /** Source file name, for provenance. */
  sourceName: string;
  /** Detected format. Only docx is targeted first; pdf comes later. */
  format: 'docx' | 'pdf';
  /** Flat text blocks extracted from the document, in reading order. */
  blocks: string[];
}
