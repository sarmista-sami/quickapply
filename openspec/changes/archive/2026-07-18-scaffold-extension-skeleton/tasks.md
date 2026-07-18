> Note: during implementation, chrome-touching concrete adapters were moved OUT of
> `src/core` to keep core browser-agnostic (AGENTS.md rule 2). Core holds interfaces +
> pure logic; edge holds concrete impls. Affected: 4.4 → `src/storage/`, 4.6 →
> `src/site-adapters/workday/`. Package manager runs via `corepack pnpm` (direct
> global pnpm install blocked by Program Files EPERM).

## 1. Project scaffold

- [x] 1.1 Initialize WXT + React + TS project with pnpm (`package.json`, `wxt.config.ts`, `tsconfig.json`, `@wxt-dev/module-react`)
- [x] 1.2 Configure `wxt.config.ts`: MV3, `sidePanel` + `storage` permissions, no `host_permissions`, action opens side panel
- [x] 1.3 Add scripts: `dev`, `build`, `test`, `compile` (tsc --noEmit); add ESLint + Prettier (WXT defaults)
- [x] 1.4 Add `.gitignore` (node_modules, `.output`, `.wxt`, etc.)

## 2. Entrypoints

- [x] 2.1 `entrypoints/background.ts` — open side panel on action click
- [x] 2.2 `entrypoints/sidepanel/` — React app shell (index.html, main.tsx, App.tsx) that renders a minimal placeholder
- [x] 2.3 `entrypoints/content.ts` — stub content script, no page mutation (scoped to Workday domains)

## 3. Data model

- [x] 3.1 `src/types/applicant-data.ts` — Zod schemas: Contact, WorkItem, EduItem, Link, ApplicantData (with `extra`); export inferred TS types; no password/payment fields
- [x] 3.2 `src/types/raw-resume.ts` — minimal `RawResume` type (parser output placeholder)

## 4. Core layer stubs (no chrome.*/DOM imports)

- [x] 4.1 `src/core/parser/index.ts` — `parse(file: File): Promise<RawResume>` stub throwing `NotImplemented`
- [x] 4.2 `src/core/normalizer/index.ts` — `normalize(raw: RawResume): ApplicantData` stub throwing `NotImplemented`
- [x] 4.3 `src/core/applicant-data/storage-port.ts` — `StoragePort` interface (`load`/`save`)
- [x] 4.4 `src/storage/sync-storage-adapter.ts` — `SyncStorageAdapter` stub implementing `StoragePort`, throwing `NotImplemented` (edge, not core — touches chrome.storage)
- [x] 4.5 `src/core/site-adapter/types.ts` — `SiteAdapter` interface (`matches`/`plan`/`fill`), `FieldFill`, `FillResult` types
- [x] 4.6 `src/site-adapters/workday/index.ts` — `WorkdayAdapter` stub implementing `SiteAdapter` (edge, not core — `fill` mutates DOM); `matches` implemented, `plan`/`fill` throw `NotImplemented`
- [x] 4.7 `src/messaging/protocol.ts` — typed sidepanel↔content message types (definitions only)

## 5. Tests

- [x] 5.1 Configure Vitest (`vitest.config.ts`) for `src/**`
- [x] 5.2 `applicant-data.test.ts` — valid data passes, malformed rejected, `extra` round-trips, no sensitive keys present
- [x] 5.3 `parser.test.ts`, `normalizer.test.ts` — assert stubs throw `NotImplemented`
- [x] 5.4 `sync-storage-adapter.test.ts`, `workday-adapter.test.ts` — assert stubs throw `NotImplemented`; `plan` and `fill` are distinct on the interface

## 6. Verification

- [x] 6.1 `pnpm compile` clean (typecheck)
- [x] 6.2 `pnpm test` green (13 tests, 5 files)
- [x] 6.3 `pnpm build` produces loadable `.output/`; manifest has MV3 + sidePanel + storage, no host_permissions
- [x] 6.4 Load unpacked in Chrome: side panel opens on action click, app shell renders — verified manually by user
- [x] 6.5 Confirm no `src/core/*` file imports `chrome.*` or DOM globals
