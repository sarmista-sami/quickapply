## Why

The project has no code yet — only instructions and an OpenSpec setup. Before any
feature work (resume parsing, storage, form-filling), we need a runnable extension
skeleton with the 4-layer architecture boundaries locked in place, so every later
stage fills in stubs against fixed, testable contracts instead of reshaping structure.

## What Changes

- Scaffold a WXT + React + TypeScript MV3 Chrome extension using pnpm.
- Add three browser entrypoints: `background` (opens side panel on action click),
  `sidepanel` (React app shell), and `content` (filler injection point — stub).
- Create empty **typed stubs** for the 4 architecture layers: parser, normalizer,
  applicant-data (+ storage port), site-adapter (+ Workday adapter). Stubs throw
  `NotImplemented`; interfaces and the `ApplicantData` Zod model are real.
- Define the shared, website-agnostic `ApplicantData` Zod schema (contact, work,
  education, skills, links, `extra`) — passwords/payment fields intentionally absent.
- Wire Vitest with placeholder tests proving the model validates and each stub is
  reachable.
- Enforce **core isolation**: `src/core/*` never imports `chrome.*` or DOM.
- Standard tooling: `pnpm dev/build/test/compile`, ESLint + Prettier (WXT defaults).

No feature behavior ships in this change — parsing, storage, and form-filling are
later stages. This is structure + contracts + a side panel that opens.

## Capabilities

### New Capabilities
- `extension-skeleton`: Runnable WXT MV3 extension with side panel that opens on
  action click, background/content/sidepanel entrypoints, and build/dev/test tooling.
- `applicant-data-model`: The normalized, website-agnostic `ApplicantData` Zod schema
  and TypeScript types shared across all layers; excludes sensitive fields by design.
- `core-layer-contracts`: Typed interface stubs for the parser, normalizer,
  storage port, and site-adapter layers (including a `plan()`/`fill()` split and a
  Workday adapter stub) that lock layer boundaries for later stages.

### Modified Capabilities
<!-- none — first change in the project -->

## Impact

- New files: `wxt.config.ts`, `package.json`, `tsconfig.json`, `entrypoints/*`,
  `src/core/*`, `src/types/*`, `src/messaging/*`, test files.
- New dev dependencies: WXT, React, TypeScript, Zod, Vitest, ESLint, Prettier, pnpm.
- Manifest permissions introduced: `sidePanel`, `storage`. No `host_permissions` yet
  (added per-adapter in the Workday stage).
- No existing code affected (greenfield). Establishes conventions all later changes
  build on (see `AGENTS.md`).
