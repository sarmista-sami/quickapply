## Context

Post-implementation audit of every source file. The autofill loop is the only
user-facing showstopper; the rest are correctness/perf/UX defects worth fixing while the
codebase is small. Constraints unchanged: core browser-free, never submit, empty-only
autofill.

## Goals / Non-Goals

**Goals:** kill the refill loop; correct parsing/UX bugs; keep every suite green.
**Non-Goals:** new features; visual redesign (separate change).

## Decisions

**Current-value readers per kind.** `currentValueOf` gains dropdown/multiselect/date
readers: dropdown reads the wrapper `button` text and treats placeholder-ish values
("", "select one", "select") as empty; multiselect joins `selectedItem` chip texts; date
reads the year section input. Readers return `''` when present-but-empty (so autofill
fills) and the real value once filled (so autofill skips). This keeps `autofillEmpty`'s
single rule — fill only `!currentValue` — working for every kind.

**Attempted-set with URL reset.** Even with correct readers, a value with no matching
option would retry per mutation. `autofillEmpty` accepts an optional `attempted` set of
`selector::value` keys; the content runner owns the set and clears it when
`location.href` changes (Workday steps are SPA navigations), so each field is attempted
once per step.

**Email-stripping before URL detection.** `detectLinks` runs on text with email matches
removed. Simpler and safer than lookbehind assertions on the URL regex.

**Draft-state list fields.** A small `ListTextArea` keeps the raw string in local state,
commits parsed values on blur, and re-syncs when the upstream value changes identity.

**Format guards module.** `src/parsers/guards.ts` exports `isDocx`/`isPdf` (pure string
checks); the pipeline picks the branch before dynamically importing an extractor. The
extractor modules keep their own guards re-exported for compatibility.

## Risks / Trade-offs

- [Dropdown placeholder text differs per tenant/language] → placeholder match is
  conservative (empty or starts with "select"); worst case a filled dropdown reads
  non-empty (correct) or a localized placeholder reads as filled (autofill skips — safe
  direction, user fills manually).
- [Attempted-set hides retries after a legit failure] → "Fill now" in the panel always
  re-applies manually.

## Open Questions

- None.
