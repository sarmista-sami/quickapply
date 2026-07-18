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

// Title-case tokens written in ALL CAPS (e.g. "PRIYADARSHINI" → "Priyadarshini") so forms don't
// flag the name. Mixed-case tokens (McDonald, O'Brien) are left untouched.
function normalizeNameCase(token: string): string {
  if (!/^[A-Z][A-Z'-]*[A-Z]$/.test(token)) return token;
  return token.charAt(0) + token.slice(1).toLowerCase();
}

function sectionsOf(raw: RawResume, kind: ResumeSection['kind']): ResumeSection[] {
  return raw.sections.filter((s) => s.kind === kind);
}

// A header line (has a separator) starts a new entry; following lines are bullets.
const ENTRY_SEP = /\s+[—–-]\s+|\s+\|\s+|\s+\bat\b\s+/i;

function toWorkItems(section: ResumeSection): WorkItem[] {
  const items: WorkItem[] = [];
  let current: WorkItem | null = null;

  for (const line of section.blocks) {
    if (ENTRY_SEP.test(line)) {
      const [company = '', title = ''] = line.split(ENTRY_SEP);
      current = {
        company: company.trim(),
        title: title.trim(),
        startDate: '',
        current: false,
        bullets: [],
      };
      items.push(current);
    } else if (current) {
      current.bullets.push(line);
    } else {
      // No header seen yet — start a bare entry so the text isn't lost.
      current = { company: line.trim(), title: '', startDate: '', current: false, bullets: [] };
      items.push(current);
    }
  }
  return items;
}

function toEduItems(section: ResumeSection): EduItem[] {
  return section.blocks.map((line) => {
    const [school = line, degree] = line.split(ENTRY_SEP);
    return {
      school: school.trim(),
      degree: degree?.trim(),
      field: undefined,
      startDate: undefined,
      endDate: undefined,
    };
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
