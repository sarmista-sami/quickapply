/**
 * Raw, format-agnostic output of the parser layer (Layer 1), before normalization.
 *
 * Holds high-confidence detected fields plus best-effort section segmentation. The
 * normalizer maps this to the {@link ApplicantData} model. Deliberately loose about
 * work/education structure — résumés are unstructured and the user corrects the rest.
 */

export type LinkKind = 'linkedin' | 'github' | 'other';

export interface DetectedLink {
  url: string;
  kind: LinkKind;
}

/** Reliable, regex-extracted fields. Optional because a résumé may omit any. */
export interface DetectedFields {
  name?: string;
  email?: string;
  phone?: string;
  links: DetectedLink[];
}

export type SectionKind = 'work' | 'education' | 'skills' | 'unclassified';

export interface ResumeSection {
  kind: SectionKind;
  /** The heading line that introduced this section, if any. */
  heading?: string;
  /** Non-empty text blocks under the heading, in reading order. */
  blocks: string[];
}

export interface RawResume {
  /** Source file name, for provenance. */
  sourceName: string;
  /** Detected format. docx is targeted first; pdf comes later. */
  format: 'docx' | 'pdf';
  /** High-confidence detected fields. */
  fields: DetectedFields;
  /** Best-effort section segmentation of the remaining text. */
  sections: ResumeSection[];
}
