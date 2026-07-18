import type {
  RawResume,
  DetectedFields,
  DetectedLink,
  ResumeSection,
  SectionKind,
} from '@/src/types/raw-resume';

export interface ParseMeta {
  sourceName: string;
  format: 'docx';
}

/**
 * Layer 1 — Parser. Pure: text in, {@link RawResume} out. No chrome.* / DOM access,
 * no file/docx handling (that is done at the edge). Extraction is heuristic:
 * high-confidence regex fields + best-effort section segmentation. The user corrects
 * the fuzzy parts in the preview.
 */
export function parse(text: string, meta: ParseMeta): RawResume {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  return {
    sourceName: meta.sourceName,
    format: meta.format,
    fields: detectFields(lines),
    sections: segmentSections(lines),
  };
}

// --- Reliable field detection ------------------------------------------------

const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const URL_RE = /\b((?:https?:\/\/)?(?:www\.)?[A-Za-z0-9-]+\.[A-Za-z]{2,}(?:\/[^\s)]*)?)/g;
const PHONE_CANDIDATE_RE = /\+?[\d][\d\s().-]{7,}\d/g;

export function detectFields(lines: string[]): DetectedFields {
  const joined = lines.join('\n');

  const email = joined.match(EMAIL_RE)?.[0];
  const phone = detectPhone(joined);
  const links = detectLinks(joined);
  const name = detectName(lines, email, phone);

  return { name, email, phone, links };
}

function detectPhone(text: string): string | undefined {
  for (const candidate of text.match(PHONE_CANDIDATE_RE) ?? []) {
    const digits = candidate.replace(/\D/g, '');
    // Plausible phone number length; excludes years and short numerics.
    if (digits.length >= 9 && digits.length <= 15) return candidate.trim();
  }
  return undefined;
}

function detectLinks(text: string): DetectedLink[] {
  const seen = new Set<string>();
  const links: DetectedLink[] = [];
  for (const match of text.matchAll(URL_RE)) {
    const raw = match[1];
    if (!raw) continue;
    const url = normalizeUrl(raw);
    if (seen.has(url)) continue;
    seen.add(url);
    links.push({ url, kind: classifyLink(url) });
  }
  return links;
}

function normalizeUrl(raw: string): string {
  const trimmed = raw.replace(/[.,;]+$/, '');
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function classifyLink(url: string): DetectedLink['kind'] {
  if (/linkedin\.com/i.test(url)) return 'linkedin';
  if (/github\.com/i.test(url)) return 'github';
  return 'other';
}

function detectName(lines: string[], email?: string, phone?: string): string | undefined {
  for (const line of lines.slice(0, 5)) {
    if (email && line.includes(email)) continue;
    if (phone && line.includes(phone)) continue;
    if (EMAIL_RE.test(line) || /https?:\/\/|www\./i.test(line)) continue;
    if (headingKind(line)) continue;
    // A name is short, mostly letters, 1–4 words.
    const words = line.split(/\s+/);
    if (words.length >= 1 && words.length <= 4 && /^[A-Za-z.,'\- ]+$/.test(line)) {
      return line;
    }
  }
  return undefined;
}

// --- Best-effort section segmentation ---------------------------------------

const HEADINGS: { kind: SectionKind; re: RegExp }[] = [
  { kind: 'work', re: /^(work experience|experience|employment|professional experience|work history)$/i },
  { kind: 'education', re: /^(education|academic background|academics)$/i },
  { kind: 'skills', re: /^(skills|technical skills|core competencies|competencies)$/i },
];

export function headingKind(line: string): SectionKind | undefined {
  const normalized = line.replace(/:$/, '').trim();
  if (normalized.length > 40 || normalized.split(/\s+/).length > 4) return undefined;
  return HEADINGS.find((h) => h.re.test(normalized))?.kind;
}

export function segmentSections(lines: string[]): ResumeSection[] {
  const sections: ResumeSection[] = [];
  let current: ResumeSection = { kind: 'unclassified', blocks: [] };

  for (const line of lines) {
    const kind = headingKind(line);
    if (kind) {
      if (current.blocks.length > 0) sections.push(current);
      current = { kind, heading: line, blocks: [] };
    } else {
      current.blocks.push(line);
    }
  }
  if (current.blocks.length > 0) sections.push(current);

  return sections;
}
