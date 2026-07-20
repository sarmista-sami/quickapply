import type { RawResume, ResumeSection } from '@/src/types/raw-resume';
import type { ApplicantData, WorkItem, EduItem, Link } from '@/src/types/applicant-data';

/**
 * Layer 2 — Normalizer. Pure: maps {@link RawResume} to the {@link ApplicantData}
 * shape, applying sensible defaults. Best-effort — the result may still fail schema
 * validation when the résumé omitted required fields; the preview surfaces those and
 * the user fills them in. No chrome.* / DOM access.
 */
export function normalize(raw: RawResume): ApplicantData {
  const { firstName, lastName } = splitName(raw.fields.name);

  return {
    contact: {
      firstName,
      lastName,
      email: raw.fields.email ?? '',
      phone: raw.fields.phone,
      location: undefined,
    },
    work: sectionsOf(raw, 'work').flatMap(toWorkItems),
    education: sectionsOf(raw, 'education').flatMap(toEduItems),
    skills: sectionsOf(raw, 'skills').flatMap((s) => s.blocks).flatMap(splitSkills),
    links: raw.fields.links.map(toLink),
    extra: {},
  };
}

function splitName(name?: string): { firstName: string; lastName: string } {
  if (!name) return { firstName: '', lastName: '' };
  const parts = name.trim().split(/\s+/).map(normalizeNameCase);
  const firstName = parts[0] ?? '';
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
  return { firstName, lastName };
}

// Capitalize the first letter of each name token and lowercase the rest, so names are
// first-letter-capital only (e.g. "PRIYADARSHINI" / "mcdonald" → "Priyadarshini" / "Mcdonald").
// Exported so the Workday field map can re-apply it at fill time to data that predates
// this normalization (stale synced data, manual edits, etc.) — see AGENTS/workday-prefill.
export function normalizeNameCase(token: string): string {
  if (!token) return token;
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

function sectionsOf(raw: RawResume, kind: ResumeSection['kind']): ResumeSection[] {
  return raw.sections.filter((s) => s.kind === kind);
}

// A header line (has a separator) starts a new entry; following lines are bullets.
const ENTRY_SEP = /\s+[—–-]\s+|\s+\|\s+|\s+\bat\b\s+/i;

// --- Date-range parsing ------------------------------------------------------

const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

const PRESENT_RE = /\b(present|current|now|ongoing)\b/i;
const DATE_TOKEN = '(?:[a-z.]+\\s+)?\\d{4}|\\d{1,2}/\\d{4}|\\d{4}-\\d{1,2}';
const RANGE_RE = new RegExp(
  `(?:present|current|now|ongoing|${DATE_TOKEN})\\s*(?:-|–|—|to|until|till)\\s*(?:present|current|now|ongoing|${DATE_TOKEN})`,
  'i',
);
const DATE_GLOBAL = /(?:([a-z]{3,9})\.?\s+)?(\d{4})(?:-(\d{1,2}))?|(\d{1,2})\/(\d{4})/gi;

/** Normalized dates found in a string, in order (`YYYY` or `YYYY-MM`). */
export function extractDates(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(DATE_GLOBAL)) {
    if (m[5]) {
      out.push(`${m[5]}-${m[4]!.padStart(2, '0')}`); // MM/YYYY
    } else if (m[2]) {
      const monthName = m[1] ? MONTHS[m[1].slice(0, 3).toLowerCase()] : undefined;
      const explicit = m[3] ? m[3].padStart(2, '0') : undefined;
      const month = explicit ?? monthName;
      out.push(month ? `${m[2]}-${month}` : m[2]);
    }
  }
  return out;
}

export interface DateRange {
  startDate?: string;
  endDate?: string;
  current: boolean;
}

/** Parse a start/end range from a line, only when it looks like a date range. */
export function parseDateRange(line: string): DateRange | undefined {
  if (!RANGE_RE.test(line)) return undefined;
  const current = PRESENT_RE.test(line);
  const dates = extractDates(line);
  if (dates.length === 0 && !current) return undefined;
  return { startDate: dates[0], endDate: current ? undefined : dates[1], current };
}

/** A line that is essentially just a date range (used to drop it from bullets). */
function isPureDateLine(line: string): boolean {
  const stripped = line.replace(DATE_GLOBAL, '').replace(PRESENT_RE, '').replace(/[-–—|,()]|to|until|till/gi, '').trim();
  return stripped.length <= 2;
}

function applyDates(item: WorkItem | EduItem, headerLine: string, bullets: string[]): void {
  let range = parseDateRange(headerLine);
  if (!range) {
    for (let i = 0; i < bullets.length; i += 1) {
      const r = parseDateRange(bullets[i]!);
      if (r) {
        range = r;
        if (isPureDateLine(bullets[i]!)) bullets.splice(i, 1);
        break;
      }
    }
  }
  if (!range) return;
  if ('bullets' in item) {
    item.startDate = range.startDate ?? '';
    item.endDate = range.endDate;
    item.current = range.current;
  } else {
    item.startDate = range.startDate;
    item.endDate = range.endDate;
  }
}

function toWorkItems(section: ResumeSection): WorkItem[] {
  const items: { item: WorkItem; header: string }[] = [];
  let current: { item: WorkItem; header: string } | null = null;

  for (const line of section.blocks) {
    // A date-range line (e.g. "Jan 2019 - Present") also contains a dash, so exclude it
    // from being read as an entry header.
    if (ENTRY_SEP.test(line) && !parseDateRange(line)) {
      const [company = '', title = ''] = line.split(ENTRY_SEP);
      current = { item: { company: company.trim(), title: title.trim(), startDate: '', current: false, bullets: [] }, header: line };
      items.push(current);
    } else if (current) {
      current.item.bullets.push(line);
    } else {
      current = { item: { company: line.trim(), title: '', startDate: '', current: false, bullets: [] }, header: line };
      items.push(current);
    }
  }
  for (const { item, header } of items) applyDates(item, header, item.bullets);
  return items.map((i) => i.item);
}

function toEduItems(section: ResumeSection): EduItem[] {
  return section.blocks.map((line) => {
    const [school = line, rest] = line.split(ENTRY_SEP);
    const degreeText = rest?.trim();
    // Best-effort field of study: "<degree> in <field>".
    const fieldMatch = degreeText?.match(/\bin\s+([A-Za-z][A-Za-z &]+)/i);
    const item: EduItem = {
      school: school.trim(),
      degree: degreeText ? degreeText.replace(/\s+in\s+[A-Za-z][A-Za-z &]+$/i, '').trim() || degreeText : undefined,
      field: fieldMatch?.[1]?.trim(),
      startDate: undefined,
      endDate: undefined,
    };
    applyDates(item, line, []);
    return item;
  });
}

function splitSkills(block: string): string[] {
  return block
    .split(/[,;•|]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function toLink(link: { url: string; kind: string }): Link {
  return { label: link.kind, url: link.url };
}
