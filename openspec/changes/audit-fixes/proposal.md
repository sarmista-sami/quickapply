## Why

A full-repo audit found one critical defect and a series of smaller bugs/inefficiencies.
The critical one: auto-fill cannot tell whether dropdown/multiselect/date fields are
already filled (their current value reads as `undefined`), so the MutationObserver pass
re-fills them forever — on a real Workday page the country dropdown would reopen every
~400 ms and fight the user.

## What Changes

1. **Autofill loop (critical).** The Workday adapter now reads a real current value for
   every field kind — dropdown (button text vs placeholder), multiselect (selected chips),
   date (year section value) — so `autofillEmpty` fills each empty field once and then
   skips it. Additionally, autofill tracks attempted selectors so an unmatchable value
   (e.g. a dropdown option that doesn't exist) is tried once per page/step, not retried on
   every mutation; the attempted set resets when the SPA URL changes.
2. **Email leaks into links.** The parser's URL detector matched the domain inside an
   email address (`ada@example.com` → link `https://example.com`). Emails are stripped
   before link detection.
3. **Broken list editing in the preview.** Skills (comma-split) and work bullets
   (line-split) textareas normalized on every keystroke, eating typed commas/newlines.
   They now keep a local draft and commit on blur.
4. **PDF uploads loaded mammoth.** Format sniffing lived inside the heavy extractor
   modules; a tiny `guards.ts` now decides the format so only the matching extractor
   chunk is fetched.
5. **Sync chunk headroom.** 6000-char chunks could exceed the ~8 KB per-item quota after
   JSON escaping; chunk size reduced to 3500 chars.
6. **Stale data during multi-step applications.** The content script now reloads
   `ApplicantData` on `chrome.storage.onChanged`, so panel edits apply to later steps
   without a page reload.
7. **Minor:** date month written zero-padded (`06`); non-matching messages get a typed
   error response instead of a mis-shaped one; clearing data also clears the sync
   warning; the panel review refreshes when the applicant data changes.

## Capabilities

### Modified Capabilities
- `workday-prefill`: auto-fill reads current values for all field kinds and attempts each
  unfillable field once per page/step (no repeated interference).

<!-- Other fixes are implementation-level; covered by tasks + tests, no spec changes. -->

## Impact

- `src/site-adapters/workday/{index,autofill,interactions,field-map}.ts`,
  `src/core/parser/index.ts`, `src/parsers/guards.ts` (new), `entrypoints/sidepanel/*`,
  `entrypoints/content.ts`, `src/storage/synced-storage-adapter.ts`. Tests extended.
  No permission changes.
