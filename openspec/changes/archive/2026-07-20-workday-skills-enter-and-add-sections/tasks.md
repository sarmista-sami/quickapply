## 1. Skills / multiselect commit

- [x] 1.1 `dom.ts`: `pressEnter(el)` (keydown+keyup Enter, keyCode/which 13, bubbling)
- [x] 1.2 `interactions.ts`: rewrite `selectMultiple` — click option if present else pressEnter; confirm via new selected chip (count before/after); shorter option timeout

## 2. Section prepare

- [x] 2.1 `interactions.ts`: `clickAddForSection(nameRe)` — match an add-button by nearby heading text
- [x] 2.2 `SiteAdapter.prepare?(data)` optional in `src/core/site-adapter/types.ts`
- [x] 2.3 `WorkdayAdapter.prepare(data)` — click Education/Work "Add" when data exists but the field is absent; wait for the field
- [x] 2.4 `autofillEmpty` calls `adapter.prepare?.(data)` before planning

## 3. Tests + verification

- [x] 3.1 e2e: multiselect commits via Enter-only fixture (chip added); existing option-click fixture still passes
- [x] 3.2 e2e: education "Add" fixture — `prepare` reveals `formField-degree`, then it fills; no double-add on a second pass
- [x] 3.3 `pnpm compile` / `pnpm test` / `pnpm e2e` / `pnpm lint` / `pnpm build` green
- [x] 3.4 No `src/core/*` chrome/DOM imports
