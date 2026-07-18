## 1. Dependencies & types

- [x] 1.1 Add `mammoth` dependency (via `corepack pnpm add mammoth`)
- [x] 1.2 Refine `RawResume` in `src/types/raw-resume.ts` — typed detected fields (email/phone/links/name) + classified section blocks (work/education/skills/unclassified)

## 2. docx extraction (edge)

- [x] 2.1 `src/parsers/docx/extract.ts` — `extractDocxText(buffer: ArrayBuffer): Promise<string>` via `mammoth.extractRawText`
- [x] 2.2 `src/parsers/docx/extract.test.ts` — extraction returns text for a fixture buffer (or mocked mammoth); rejects non-docx upstream

## 3. Core parser (pure)

- [x] 3.1 Update parser signature to `parse(text: string, meta): RawResume` in `src/core/parser/index.ts`; implement reliable-field regex (email, phone, URLs→classified links, name heuristic)
- [x] 3.2 Implement best-effort section segmentation (Experience/Education/Skills heading detection → block slicing)
- [x] 3.3 `src/core/parser/parser.test.ts` — replace stub test; assert reliable fields + section grouping against sample-text fixtures; assert no chrome/DOM usage

## 4. Core normalizer (pure)

- [x] 4.1 Implement `normalize(raw): ApplicantData` in `src/core/normalizer/index.ts` (map detected fields + sections, apply schema defaults)
- [x] 4.2 `src/core/normalizer/normalizer.test.ts` — replace stub test; output passes `ApplicantDataSchema`; defaults applied

## 5. Local persistence (edge)

- [x] 5.1 `src/storage/local-storage-adapter.ts` — `LocalStorageAdapter implements StoragePort` over `chrome.storage.local`
- [x] 5.2 `src/storage/local-storage-adapter.test.ts` — save/load round-trip and empty→null (mock `chrome.storage.local`)

## 6. Side-panel upload & preview UI

- [x] 6.1 Pipeline helper: `File → extractDocxText → parse → normalize → validate` returning `ApplicantData` (edge, wires layers)
- [x] 6.2 Upload component — `.docx` file picker; unsupported-format message
- [x] 6.3 Editable grouped preview — contact/work/education/skills/links/extra rows bound to working state
- [x] 6.4 Inline Zod validation — per-field errors; disable Save while invalid
- [x] 6.5 Load-on-open — call `StoragePort.load()`; show saved data or upload; allow re-upload
- [x] 6.6 Save — persist via `StoragePort.save()`
- [x] 6.7 Wire `App.tsx` to the above using `LocalStorageAdapter`

## 7. Verification

- [x] 7.1 `pnpm compile` clean
- [x] 7.2 `pnpm test` green (parser/normalizer/extract/adapter suites)
- [x] 7.3 `pnpm build` produces loadable `.output/`; no new permissions, still no host_permissions
- [ ] 7.4 Manual: upload a real `.docx`, verify fields populate, edit, save, reload panel shows saved data — **needs user**
- [x] 7.5 Confirm no `src/core/*` imports `chrome.*` / DOM globals
