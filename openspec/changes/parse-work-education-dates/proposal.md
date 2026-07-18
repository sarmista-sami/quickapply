## Why

The normalizer maps work/education entries but leaves dates empty, so the Workday date
fields (start/end) and "currently work here" never get pre-filled from a résumé. Parsing
date ranges out of the entry text makes those fills useful.

## What Changes

- Add a date-range parser to the normalizer that recognizes common résumé formats:
  `2018 – 2020`, `Jan 2018 - Present`, `01/2018 – 06/2020`, month-name ranges, and
  single years. Outputs `startDate`/`endDate` as `YYYY` or `YYYY-MM`, and sets `current`
  when the end is "Present"/"Current".
- Apply it in work entries (scan header + bullets; drop a pure date-line bullet) and in
  education entries (dates + best-effort field of study).

## Capabilities

### Modified Capabilities
- `resume-parsing`: the normalizer extracts work/education dates (and current-role flag)
  from entry text.

## Impact

- `src/core/normalizer/index.ts` (+ tests). Pure; no other layers affected. Improves the
  data feeding the existing Workday date/checkbox fills.
