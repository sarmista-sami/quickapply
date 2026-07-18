## 1. Typed field map

- [x] 1.1 Add a `kind` (`text|textarea|checkbox|dropdown|multiselect|date`) + value derivation to `WorkdayField` entries in `field-map.ts`; keep existing text entries working
- [x] 1.2 Map new fields: `currentlyWorkHere` (checkbox ← work[0].current), `degree` (dropdown ← education[0].degree), `skills` (multiselect ← skills), work start/end dates (date ← work[0].startDate/endDate)
- [x] 1.3 Update field-map unit tests for typed entries + new mappings

## 2. Interaction strategies (edge)

- [x] 2.1 `src/site-adapters/workday/interactions.ts` — `setCheckbox`, `selectDropdown` (open → match promptOption → click), `selectMultiple` (type → match → chip), `setDate` (month/year section native-setter)
- [x] 2.2 Tolerant option matching (exact case-insensitive → contains); document-wide option query with bounded waits; never target submit controls

## 3. Adapter dispatch

- [x] 3.1 `plan(data)` emits `FieldFill{ strategy }` per kind (multiselect value joined for preview; checkbox/date encoded)
- [x] 3.2 `fill(plan)` dispatches by strategy to the interaction; aggregate `FillResult`; per-field try/catch so one failure never aborts
- [x] 3.3 Keep text/textarea path unchanged

## 4. e2e fixtures + specs

- [x] 4.1 `e2e/fixtures/workday-widgets.html` — controlled checkbox, searchable dropdown (button + portal option list + chip), date sections, modeled on captured markup
- [x] 4.2 `e2e/workday-widgets.spec.ts` — checkbox toggles; dropdown selects matching option; multiselect adds chips; date sections set; unmatched option → skipped; no submit fired

## 5. Verification

- [x] 5.1 `pnpm compile` clean
- [x] 5.2 `pnpm test` green (typed map + existing)
- [x] 5.3 `pnpm e2e` green (widgets + existing)
- [x] 5.4 `pnpm build` — loadable, no permission changes
- [x] 5.5 No `src/core/*` chrome/DOM imports
- [ ] 5.6 Manual (real Workday): dropdowns/dates/skills/checkbox fill on My Information + My Experience; no submit — **needs user**
