## 1. Auto-fill helper + content script

- [x] 1.1 `src/site-adapters/workday/autofill.ts` — `autofillEmpty(adapter, data)`: plan → fill only entries with empty `currentValue`
- [x] 1.2 `entrypoints/content.ts` — on load, load `ApplicantData` (SyncedStorageAdapter) and run `autofillEmpty`; re-run via a debounced MutationObserver; keep message handlers; never submit

## 2. Panel review

- [x] 2.1 `FillPage` — auto-run preview on mount (review list); button becomes "Fill now" (manual overwrite); keep Attach résumé

## 3. Name casing

- [x] 3.1 `normalizeNameCase` → first-letter-capital only for every token
- [x] 3.2 Update normalizer tests (e.g. `mcdonald` → `Mcdonald`, `ada` → `Ada`)

## 4. Tests + verification

- [x] 4.1 e2e: fixture with one pre-filled + several empty fields; `autofillEmpty` fills empties, skips the pre-filled, no submit
- [x] 4.2 `pnpm compile` / `pnpm test` / `pnpm e2e` / `pnpm build` / `pnpm lint` green
- [x] 4.3 No `src/core/*` chrome/DOM imports
- [x] 4.4 Update `AGENTS.md` rule wording (auto-fill empty on detect; still never auto-submit)
- [ ] 4.5 Manual (real Workday): fields auto-fill on load + across steps; edits not clobbered; no submit — **needs user**
