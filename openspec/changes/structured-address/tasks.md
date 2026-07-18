## 1. Model

- [x] 1.1 Add `AddressSchema` (all optional) and `address?` to `ContactSchema` in `src/types/applicant-data.ts`; export `Address` type
- [x] 1.2 Unit tests: address round-trips; data without address still validates

## 2. Workday map

- [x] 2.1 Map `addressLine1` (← `address.line1` ?? `location`), `city`, `postalCode` (text) and `country` (dropdown) in `field-map.ts`
- [x] 2.2 Field-map unit tests for address + country (dropdown kind)

## 3. Preview

- [x] 3.1 Add an editable Address group to `Preview.tsx` (line1, line2, city, state, postalCode, country)

## 4. Verification

- [x] 4.1 `pnpm compile` clean
- [x] 4.2 `pnpm test` green
- [x] 4.3 `pnpm e2e` green (extend a fixture/spec to cover country dropdown + city fill)
- [x] 4.4 `pnpm build` loadable; no permission changes
- [x] 4.5 No `src/core/*` chrome/DOM imports
