## 1. Date parser

- [x] 1.1 Add `parseDateRange(text)` to the normalizer (month-name + numeric + year ranges; Present/Current → current flag; YYYY / YYYY-MM output)
- [x] 1.2 Apply in `toWorkItems` (scan header + bullets; drop pure date-line bullets; set start/end/current)
- [x] 1.3 Apply in `toEduItems` (dates + best-effort field of study)

## 2. Tests + verification

- [x] 2.1 Unit tests for `parseDateRange` (year range, month-year + Present, numeric, none)
- [x] 2.2 Normalizer tests: work/education entries get dates + current flag
- [x] 2.3 `pnpm compile` / `pnpm test` / `pnpm build` green
- [x] 2.4 No `src/core/*` chrome/DOM imports
