## Context

`ApplicantData.contact` has `location?: string`. Workday needs `addressLine1`, `city`,
`postalCode`, and a `country` dropdown (captured in `docs/workday-dom-reference.md`). The
rich-field strategies (dropdown) already exist. Constraint: `src/core` stays browser-free;
schema stays sensitive-field-free (address is fine).

## Goals / Non-Goals

**Goals:** structured, editable, syncable address; Workday fill of address lines/city/
postal/country; backward-compatible with existing stored data.

**Non-Goals:** parsing structured addresses out of résumé text (rare/unreliable — user
enters/edits and it syncs); state/province dropdown parity for every country.

## Decisions

**Optional structured `address`, keep `location`.** Adding `address?` (all subfields
optional) is backward compatible — existing stored `ApplicantData` without it still
validates. `location` remains a freeform fallback the map uses when `address.line1` is
absent.

**Country via the existing dropdown strategy.** `country` maps to `formField-country` with
kind `dropdown`, reusing 4b's `selectDropdown` (exact-then-contains option match). Value is
`address.country`.

**User-entered, then synced.** The normalizer does not invent address data; `address` is
populated in the preview and roams via `chrome.storage.sync`. This avoids brittle address
parsing while still delivering cross-application reuse.

## Risks / Trade-offs

- [Country option text mismatch (e.g. "USA" vs "United States")] → dropdown match is
  exact-then-contains; unmatched is reported, not fatal. Users can correct in the preview.
- [Schema change breaks stored data] → all new fields optional; add a test loading a
  pre-change object.

## Open Questions

- Whether to later add a country-name normalization table; defer until real mismatches show.
