# Resume Autofill

A Chrome extension (MV3) that parses your résumé, lets you review and edit the extracted
fields in a side panel, remembers them across devices via your Google account, and
pre-fills job-application forms — starting with **Workday**.

## What it does

1. **Upload** a résumé (`.docx` or `.pdf`).
2. **Parse + normalize** it into a website-agnostic `ApplicantData` model.
3. **Review & edit** every field in the side panel (inline validation).
4. **Save** — fields roam to your other devices via `chrome.storage.sync`.
5. **Pre-fill** a Workday application: preview what will be filled, then fill (text,
   dropdowns, multiselect, dates, checkboxes) and attach the résumé file. **Never submits.**

## Architecture (4 layers)

Data flows one direction; `src/core/*` is pure and browser-free (no `chrome.*` / DOM).

| Layer | Location | Responsibility |
|---|---|---|
| 1. Parser | `src/core/parser` | résumé text → `RawResume` (regex fields + best-effort sections + date ranges) |
| 2. Normalizer | `src/core/normalizer` | `RawResume` → `ApplicantData` (name casing, work/education dates, field of study) |
| 3. ApplicantData | `src/core/applicant-data` + `src/types` | the normalized Zod model + `StoragePort` interface |
| 4. Site Adapter | `src/core/site-adapter` (interface) + `src/site-adapters/workday` (impl) | `ApplicantData` → form fills (`plan`/`fill`, never submit) |

**Edge modules** (touch the browser, live outside `src/core`):
- `src/parsers/docx`, `src/parsers/pdf` — text extraction (mammoth / pdf.js, lazy-loaded).
- `src/storage/synced-storage-adapter` — full model roams via `chrome.storage.sync`,
  chunked to beat the 8 KB/item cap, with a local mirror; `resume-file-store` keeps the
  original file locally.
- `src/site-adapters/workday` — field map, DOM interaction strategies, résumé attach.
- `entrypoints/` — `background` (opens side panel), `sidepanel` (React app), `content`
  (Workday-scoped; handles preview/fill/attach messages).

## Stack

WXT · React + TypeScript · Chrome Side Panel API · Zod · Vitest (unit) · Playwright (DOM
e2e) · pnpm.

## Commands

```
pnpm dev       # WXT dev server + HMR
pnpm build     # production build → .output/chrome-mv3
pnpm test      # Vitest unit suite
pnpm e2e       # Playwright DOM e2e (adapter fill against fixtures)
pnpm compile   # wxt prepare + tsc typecheck
```

> On this machine pnpm runs via `corepack pnpm <cmd>` (a direct global install is blocked).

### Load the extension

`pnpm build`, then in Chrome → `chrome://extensions` → enable Developer mode → **Load
unpacked** → select `.output/chrome-mv3`. Click the toolbar icon to open the side panel.

## Workday support

Field selectors are keyed on tenant-agnostic `data-automation-id`s captured from live
postings. See **`docs/workday-dom-reference.md`** for the full application DOM (all six
steps, widget patterns, and the `ApplicantData` mapping).

Implemented: account email; My Information name/phone/address/city/postal/country; My
Experience job title/company/role description/dates/skills/degree/links; résumé file
attach. Custom dropdowns, multiselects, date pickers, and checkboxes are handled via
per-strategy DOM interactions (native property setter for React-controlled inputs).

**Never auto-filled:** passwords, the `beecatcher` honeypot, and EEO / Voluntary
Disclosure / Self-Identify fields.

### Capturing more DOM

Interactive tools in `e2e/capture/` open a real Workday page (you sign in) and dump
`data-automation-id` structure. See `e2e/real-run.md`.

## Development workflow

- **OpenSpec is the source of truth.** Every change is proposed under
  `openspec/changes/<id>/` (proposal → specs → tasks), implemented, then archived; the
  living specs are in `openspec/specs/`.
- Rules for AI agents and humans are in `AGENTS.md` (`CLAUDE.md` imports it).

## Status & roadmap

Done: scaffold; docx + PDF parsing + editable preview; cross-device sync; Workday text +
rich-field fill; structured address; résumé attach; work/education date parsing.

Not yet (need a live Workday pass or more capture): repeatable work/education entries
(multiple jobs via `add-button`), multi-step auto-advance, and Greenhouse/other sites.
Fill strategies for custom widgets are validated on fixtures modeled from captured markup;
confirm on a real posting.
