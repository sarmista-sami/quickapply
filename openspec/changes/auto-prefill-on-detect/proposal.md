## Why

The current flow gates filling behind a "Preview → Fill" click in the side panel. But the
user isn't the one advancing the Workday form, so a manual pre-fill step is friction.
Instead, the extension should fill prefillable fields automatically as soon as it detects
them, and the user reviews on the page (and in the panel) before proceeding. Also, parsed
names should be capitalized first-letter-only, not preserve mixed/upper case.

## What Changes

- **Auto-fill on detection.** The Workday content script loads the stored `ApplicantData`
  and fills mapped fields automatically when the page loads and whenever new fields appear
  (a debounced `MutationObserver` covers async / multi-step rendering). It fills only
  **empty** fields, so it never overwrites what the user typed, and it re-runs safely.
  It still **never submits or advances** the form.
- Side panel: the "Fill this Workday page" section auto-shows the current plan as a review
  (what was/will be filled) on open; the button becomes a manual "Fill now" re-trigger
  (overwrite) rather than a required first step.
- **Name casing:** normalize each name token to first-letter-capital only (`PRIYADARSHINI`,
  `mcdonald` → `Priyadarshini`, `Mcdonald`).

## Capabilities

### Modified Capabilities
- `workday-prefill`: filling is automatic on field detection (empty-only), replacing the
  required preview-before-fill step; review happens after.
- `extension-skeleton`: the content entrypoint auto-fills detected fields (plus its
  existing message handlers).

<!-- The name-casing tweak is an implementation detail of the normalizer (no spec-level
     requirement change); covered by tasks + tests. -->

## Impact

- `entrypoints/content.ts` (auto-fill + observer + storage load), new
  `src/site-adapters/workday/autofill.ts` (empty-only fill helper), `FillPage` (auto
  review + Fill-now), `src/core/normalizer` (name casing), `AGENTS.md` rule wording.
- No new permissions. `src/core` stays browser-free.
