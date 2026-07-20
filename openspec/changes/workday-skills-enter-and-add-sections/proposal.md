## Why

Two real-page issues on Workday's My Experience step:
- **Skills** (a typeahead multiselect): typing a value and clicking the option does not
  commit it — Workday's prompt needs an **Enter** keypress to add the chip. And because
  our option-click path misses, each skill waits the full option timeout, making it slow.
- **Education**: the education fields don't render until the section's **"Add"** button is
  clicked, so there's nothing on the page for the adapter to fill. The extension must
  click "Add" automatically when there's education data.

## What Changes

- Multiselect fill: after typing a value, click a matching option if present, otherwise
  press **Enter** to commit the highlighted suggestion; confirm success by detecting a new
  selected chip; shorter option timeout so misses don't stall. Skills that never produce a
  chip are reported, not silently retried.
- Add a **section-prepare** step: before filling, if the applicant has education (or work)
  data but the section's fields aren't present, click that section's "Add" button
  (matched by the button's nearby section heading) to reveal the fields. Guarded so it
  clicks once — only while the fields are absent — and never submits.

## Capabilities

### Modified Capabilities
- `workday-rich-fields`: multiselect commits via Enter (with chip confirmation) in
  addition to option click.
- `workday-prefill`: the adapter prepares repeatable sections (clicks "Add") so
  education/work fields exist before filling.

## Impact

- `src/site-adapters/workday/{dom,interactions,index}.ts`,
  `src/core/site-adapter/types.ts` (optional `prepare` on `SiteAdapter`),
  `src/site-adapters/workday/autofill.ts` (call `prepare` before planning). New e2e
  fixtures/specs. No permission changes.
