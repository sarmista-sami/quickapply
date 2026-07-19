## 1. Autofill loop (critical)

- [x] 1.1 `currentValueOf` readers for dropdown (button text vs placeholder), multiselect (chips), date (year input) in `src/site-adapters/workday/index.ts`
- [x] 1.2 `autofillEmpty(adapter, data, attempted?)` — skip `selector::value` keys already attempted; record attempts
- [x] 1.3 Content runner owns the attempted set; clears it when `location.href` changes
- [x] 1.4 e2e: filled dropdown not reopened; unmatchable dropdown attempted once across two passes

## 2. Parser

- [x] 2.1 Strip email matches from text before URL/link detection; unit test (email no longer yields a link)

## 3. Preview UX

- [x] 3.1 `ListTextArea` draft-state component; use for skills (comma) and work bullets (lines); commit on blur

## 4. Pipeline / storage

- [x] 4.1 `src/parsers/guards.ts` with pure `isDocx`/`isPdf`; pipeline sniffs before importing an extractor
- [x] 4.2 `CHUNK_SIZE` 6000 → 3500 in synced storage (JSON-escape headroom); tests still pass

## 5. Content script + panel polish

- [x] 5.1 Reload data on `chrome.storage.onChanged` and re-run autofill
- [x] 5.2 Typed error responses for non-matching adapter messages
- [x] 5.3 `setDate` writes zero-padded month; update fixture assertions
- [x] 5.4 `clearAll` also clears the sync warning; FillPage review refreshes on data change

## 6. Verification

- [x] 6.1 `pnpm compile` / `pnpm test` / `pnpm e2e` / `pnpm lint` / `pnpm build` all green
- [x] 6.2 No `src/core/*` chrome/DOM imports
