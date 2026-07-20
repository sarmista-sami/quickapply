## 1. Fix

- [x] 1.1 Export `normalizeNameCase` from `src/core/normalizer/index.ts`
- [x] 1.2 `field-map.ts`: apply it word-by-word to First name / Last name `get`
- [x] 1.3 `field-map.ts`: `CALLING_CODES` table + `nationalPhone(digits, country)`; use in Phone `get`, drop the old bare `digitsOnly` transform for phone

## 2. Tests + verification

- [x] 2.1 Unit: stale ALL-CAPS name re-cased on resolve; known-country phone strips calling code; unknown-country phone unchanged
- [x] 2.2 `pnpm compile` / `pnpm test` / `pnpm e2e` / `pnpm lint` / `pnpm build` green
- [x] 2.3 No `src/core/*` chrome/DOM imports
