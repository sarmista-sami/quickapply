## Why

Real-page testing surfaced two Workday validation errors:
- "Given Name" / "Family Name" — Workday flags a name with more than 2 capital letters.
  Name casing is normalized at résumé **parse time**, so data saved before that fix (or
  edited/typed elsewhere) can still hold an ALL-CAPS name and fill it verbatim.
- Phone — "Enter a phone number in the valid format: not valid for this region." The
  phone field is filled with the full international number including the country calling
  code (e.g. `31687508928`), but Workday's `phoneNumber` field expects the **national**
  number only — the calling code belongs to a separate `countryPhoneCode` field.

## What Changes

- Apply first-letter-capital name casing **defensively at fill time**, in the Workday
  field map, not only at parse time — so any stored/typed value is corrected regardless
  of when or how it got into `ApplicantData`.
- Strip a recognized country calling code from the phone digits before filling
  `phoneNumber`, using `contact.address.country` and a small common-country calling-code
  table. Falls back to the untouched digits when the country is unknown/unmapped.

## Capabilities

### Modified Capabilities
- `workday-prefill`: name fields are re-cased at fill time; the phone field fills the
  national number (calling code stripped when the country is known).

## Impact

- `src/core/normalizer/index.ts` (export the casing helper), `src/site-adapters/workday/field-map.ts`
  (apply casing to name fields; national-phone helper). Tests extended. No permission or
  schema changes.
