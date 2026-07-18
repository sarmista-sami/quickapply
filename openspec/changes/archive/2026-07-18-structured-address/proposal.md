## Why

The model stores address as a single freeform `contact.location`, so Workday's structured
address (line 1, city, postal code, country) can only be partially filled and the country
dropdown is left blank. A structured address lets the extension fill all address fields and
select the country, and — synced — remembers it across applications.

## What Changes

- Extend `contact` with an optional structured `address`:
  `{ line1?, line2?, city?, state?, postalCode?, country? }`. Keep `location` as an
  optional freeform fallback.
- Preview: add an editable Address group (the fields above) with inline validation.
- Workday map: fill `addressLine1` (← `address.line1`, falling back to `location`),
  `city`, `postalCode`, and the `country` custom dropdown from the structured address.
- Normalizer keeps `location` as-is; `address` starts empty and is user-entered (then
  synced/remembered). No new parsing heuristics.

## Capabilities

### New Capabilities
- `structured-address`: an editable, syncable structured address on the applicant model,
  and Workday fill of address lines, city, postal code, and country from it.

### Modified Capabilities
- `applicant-data-model`: `contact` gains an optional structured `address`.

## Impact

- `src/types/applicant-data.ts` (schema + types), preview components, Workday `field-map.ts`
  (address + country entries). Storage roams it automatically (part of `ApplicantData`).
- No manifest/permission changes. `src/core` isolation preserved.
