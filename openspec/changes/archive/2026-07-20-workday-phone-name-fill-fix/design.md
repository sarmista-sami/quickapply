## Context

`normalizeNameCase` (parser-time only, in `src/core/normalizer`) title-cases name tokens
when the résumé is parsed. But `ApplicantData.contact.firstName/lastName` can also come
from: data saved before this fix shipped (roamed via sync), or manual edits in the
preview. The Workday field map fills whatever string is in the model verbatim, so a stale
ALL-CAPS name still fails Workday's validation. Similarly the phone field is filled with
`digitsOnly(contact.phone)`, which keeps a leading country calling code if the user's
resume/preview phone includes one (e.g. `+31 6 8750 8928` → `31687508928`).

## Goals / Non-Goals

**Goals:** names fill correctly-cased regardless of source; phone fills as a national
number when the country is known.
**Non-Goals:** a full libphonenumber-style validator; every country's calling code (a
practical common-country table, extendable); rewriting stored data (fix is at fill time,
not a migration).

## Decisions

**Fill-time re-casing, not just parse-time.** Export `normalizeNameCase` (token-level)
from the normalizer and apply it, word-by-word, to `firstName`/`lastName` inside the
Workday field map's `get`. This is idempotent on already-correct data and fixes stale/
manually-typed data without needing a storage migration or forcing a re-upload.

**Country calling-code table, applied in `get`.** Because `transform` only sees the
string value (not the whole `ApplicantData`), the calling-code stripping logic lives
directly in the Phone field's `get(data)`, which already has `data.contact.address`.
A small `CALLING_CODES` map (common countries) keyed by lowercased country name maps to
a calling code; if the phone digits start with that code AND enough digits remain to look
like a real national number (heuristic: `>= code.length + 6`), the code is stripped.
Unknown country or no match → digits pass through unchanged (current behavior, safe
default).

## Risks / Trade-offs

- [Country name spelling mismatches the table] → falls back to unstripped digits (same
  behavior as before this fix — not a regression).
- [A national number that coincidentally starts with the calling code] → the length
  heuristic (`>= code.length + 6`) makes an accidental strip unlikely for real numbers;
  worst case the user corrects it in the preview.

## Open Questions

- None.
