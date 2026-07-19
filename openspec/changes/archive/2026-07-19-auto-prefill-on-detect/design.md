## Context

Today the panel drives `plan`→`fill` on user click. The user wants filling to happen
automatically when fields appear. The content script already runs on Workday pages and can
read `chrome.storage`, so it can load `ApplicantData` and fill without the panel. Rule:
never submit; edge-only DOM; `src/core` browser-free.

## Goals / Non-Goals

**Goals:** auto-fill empty mapped fields on load and as fields render; idempotent (no
clobber, no loop); user reviews after; name casing to first-letter-capital.

**Non-Goals:** auto-submit/advance, filling non-empty fields, cross-site autofill.

## Decisions

**Empty-only auto-fill in the content script.** On load, the content script loads
`ApplicantData` (via `SyncedStorageAdapter`) and runs an autofill pass: `plan(data)` then
fill only the entries whose `currentValue` is empty. A debounced (`~400 ms`)
`MutationObserver` on `document.body` re-runs the pass as Workday renders fields lazily and
across steps. Because filled fields report a non-empty `currentValue`, subsequent passes
skip them — this prevents both clobbering user input and infinite loops (the fill's own
`input`/`change` events trigger a mutation, but the field is no longer empty).

**Panel becomes review + manual override.** `FillPage` runs the preview automatically on
mount (shows current→new for present fields) so the user can review what the page holds. Its
button becomes "Fill now", a manual re-trigger that fills all mapped present fields
(overwriting), for the case where the user wants to force a refill. "Attach résumé" stays
manual (a file can't be auto-attached reliably).

**Name casing.** `normalizeNameCase` becomes an unconditional title-case
(`first.toUpperCase() + rest.toLowerCase()`) per whitespace token, matching the requested
first-letter-only format. Mixed-case exceptions (McDonald) are not preserved — the user
prefers the simple rule and can edit in the preview.

**Testability.** The empty-only logic lives in `autofill.ts`
(`autofillEmpty(adapter, data)`) so a Playwright fixture can verify it fills empties and
skips pre-filled fields, independent of the content-script/observer wiring.

## Risks / Trade-offs

- [Observer fires often on heavy pages] → Debounced; each pass is a cheap `querySelector`
  sweep of a small field map; fills only empties.
- [Auto-fill surprises the user] → Only empty fields change; the panel shows what was
  filled; nothing is submitted.
- [Storage read latency before fields render] → The observer re-runs, so a late-loaded
  data or field still gets filled on a subsequent mutation.

## Open Questions

- Whether to also re-run on `chrome.storage.onChanged` (data edited in the panel while a
  Workday tab is open). Deferred; the panel's manual "Fill now" covers it.
