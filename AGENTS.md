# AGENTS.md

Canonical instructions for any AI agent (Claude Code, etc.) working in this repo.
`CLAUDE.md` imports this file, so both read the same source. Keep rules here.

## Project

Chrome extension (MV3) that parses a resume, normalizes it into a website-agnostic
data model, lets the user review/edit fields in a side panel, remembers edits per
Google account (`chrome.storage.sync`), and pre-fills job-application forms
(Workday first, Greenhouse/others later). Resume formats: **docx first**, PDF later.

Stack: **WXT + React + TypeScript**, Chrome **Side Panel API**, **Zod** for schema
validation, **Vitest** for unit tests, **pnpm**. Playwright (form-fill e2e) deferred.

## Architecture — 4 layers

Data flows one direction; each layer is independently testable.

1. **Parser** (`src/core/parser`) — file → `RawResume`. Format-specific (docx first).
2. **Normalizer** (`src/core/normalizer`) — `RawResume` → `ApplicantData`.
3. **ApplicantData** (`src/core/applicant-data`) — the normalized model + storage port
   (parsed data merged with previously stored/edited fields).
4. **Site Adapter** (`src/core/site-adapter`) — `ApplicantData` → target form fields.
   One adapter per site (`workday/` first).

Browser entrypoints live in `entrypoints/` (background, sidepanel, content).

**Core vs edge.** `src/core/` holds interfaces + pure logic only. Concrete
implementations that touch `chrome.*` or the DOM live at the **edge**, outside core:
- `src/storage/` — `SyncStorageAdapter` (implements core `StoragePort`).
- `src/site-adapters/<site>/` — e.g. `WorkdayAdapter` (implements core `SiteAdapter`;
  its `fill()` mutates the DOM). Note: the `SiteAdapter` *interface* + `FieldFill`/
  `FillResult` types stay in `src/core/site-adapter/`.

## Rules (non-negotiable)

1. **OpenSpec is source of truth.** Every major change starts as an OpenSpec change
   under `openspec/changes/<id>/` (proposal → specs → tasks) *before* writing code.
   Use the `openspec-propose` / `openspec-apply-change` skills. No parallel design-doc
   systems.
2. **Core isolation.** `src/core/*` must NOT import `chrome.*` or touch the DOM.
   Browser/DOM access happens only through injected ports/adapters. This keeps
   layers 1–3 pure, unit-testable, and decoupled from any target website.
3. **Normalize everything.** Never couple data to a target website. All inputs become
   one consistent `ApplicantData` model. Site coupling lives only in layer 4.
4. **No sensitive fields.** The schema excludes passwords and payment details by
   design — never add them. Name / DOB / contact info are fine.
5. **Auto-fill, never auto-submit.** Site adapters expose `plan()` (compute intended
   writes, no mutation) separately from `fill()`. Detected **empty** fields are filled
   automatically (never overwriting user input); the user reviews on the page and in the
   panel. **Never submit or advance a form.**
6. **Reliable field writes.** For React/Vue/Angular/custom sites, set values via the
   native property setter (not raw `input.value =`). Adapters must handle checkboxes,
   radios, native `<select>`, custom dropdowns, date pickers, autocomplete, multi-step
   forms, iframes, Shadow DOM, and async-loaded fields (wait for them).
7. **Tests.** Parser, normalizer, and adapter mapping get Vitest coverage. Maintain
   per-site adapter tests. Playwright form-fill tests deferred to a later stage.

## Workday reference

`docs/workday-dom-reference.md` documents the real Workday application DOM (all steps,
field automation-ids, widget types, and the `ApplicantData` mapping) captured from live
postings. Raw structure dumps and the interactive capture tools live in `e2e/capture/`
(`capture-dom.mjs`, `capture-stages.mjs`, `e2e/real-run.md`). Read the reference before
extending `src/site-adapters/workday/`. Never auto-fill EEO/Voluntary-Disclosure fields,
passwords, or the `beecatcher` honeypot.

## Commands

```
pnpm dev       # WXT dev server + HMR
pnpm build     # production build → .output/
pnpm test      # Vitest
pnpm compile   # wxt prepare + tsc typecheck (no emit)
```

**pnpm on this machine:** a direct global `pnpm` install fails (EPERM on
`C:\Program Files\nodejs`). Use the corepack shim instead: `corepack pnpm <cmd>`
(e.g. `corepack pnpm test`). Build-script approvals for native deps (esbuild) live in
`pnpm-workspace.yaml` under `allowBuilds:`.

## Caveman mode

This repo runs in **caveman mode** (terse output). It is activated globally via a
Claude Code plugin (`caveman`) SessionStart hook, so every session inherits it. If a
future session lacks it, invoke the `caveman:caveman` skill or run `/caveman full`.

- Terse, fragment-friendly output. Drop articles/filler/pleasantries/hedging.
- **Write normal prose for code, commit messages, PRs, docs, and security warnings.**
- Preserve all technical substance and exact error strings.

## Development stages (roadmap)

1. **Scaffold + skeleton** (current) — WXT project, side panel that opens, empty typed
   stubs for all 4 layers + placeholder tests. OpenSpec id: `scaffold-extension-skeleton`.
2. Resume file selection + docx parsing + preview.
3. Storage of parsed/edited fields in Google account (`chrome.storage.sync`).
4. Pre-fill into Workday.
5. Later: PDF support, Greenhouse + other adapters, Playwright e2e.
