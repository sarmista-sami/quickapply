## Context

`toWorkItems`/`toEduItems` in the normalizer build entries but hardcode empty dates. The
Workday adapter already fills `startDate`/`endDate`/`currentlyWorkHere` when present, so
adding date extraction makes those fills work. Pure logic; no new dependencies.

## Goals / Non-Goals

**Goals:** extract start/end dates and current-role flag from résumé entry text, tolerant
of common formats; normalize to `YYYY` or `YYYY-MM`.

**Non-Goals:** exhaustive locale/date-format coverage; day precision; reconciling
conflicting dates.

## Decisions

**One `parseDateRange(text)` helper.** Tries, in order: month-name ranges
(`Jan 2018 – Mar 2020`), numeric `MM/YYYY` ranges, `YYYY – YYYY` ranges, and a lone
`YYYY`. "Present"/"Current"/"Now" on the right side sets `current = true` and leaves
`endDate` undefined. Month names (full + 3-letter) map to `01`–`12`.

**Where applied.** Work: scan the entry's header then bullets; the first match wins; a
bullet that is *only* a date range is dropped from bullets. Education: same, plus a
best-effort field-of-study from a "in <field>" / "<degree>, <field>" pattern.

## Risks / Trade-offs

- [Ambiguous formats mis-parsed] → Conservative regexes; unmatched text leaves dates
  empty (the user fixes them in the preview), never invents a date.
- [Date line also holds other info] → Only a bullet that is *purely* a date range is
  dropped; mixed lines are kept.

## Open Questions

- None.
