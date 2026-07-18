## Why

4a fills Workday text inputs. Real applications also need checkboxes, custom dropdowns,
multiselects, and date pickers (country, degree, phone type, skills, work dates,
"currently work here"). This increment adds those field types so more of an application
pre-fills, using the widget structures captured from live postings
(`docs/workday-dom-reference.md`).

## What Changes

- Generalize the Workday field map from text-only to typed entries:
  `text | textarea | checkbox | dropdown | multiselect | date`.
- Add DOM interaction strategies (edge, in the Workday adapter):
  - **checkbox** — set checked + dispatch events (e.g. `currentlyWorkHere`).
  - **dropdown** — click the field button, wait for the option list, click the option
    whose text matches the target value (e.g. `degree`, `country`, `phoneType`).
  - **multiselect** — for each value, type into the search box and click the matching
    option, accumulating chips (e.g. `skills`).
  - **date** — write month/year (and day when present) section inputs via the native setter.
- `plan()` reports these as `FieldFill`s with a `strategy`, so the preview shows what will
  change; `fill()` dispatches by strategy. Missing options are reported, not thrown. Still
  never submits.
- Map new fields: work `currentlyWorkHere`, `skills`, education `degree`, work From/To
  dates. (Country/phone-code left until a structured address exists in the model.)
- Playwright fixtures modeled on the captured Workday markup (searchable dropdown, chip
  multiselect, date sections, controlled checkbox) to validate each strategy.

## Capabilities

### New Capabilities
- `workday-rich-fields`: pre-fill of Workday checkbox, custom dropdown, multiselect, and
  date-picker fields via typed field-map entries and per-strategy DOM interactions, with
  preview and no auto-submit.

### Modified Capabilities
- `workday-prefill`: the field map and adapter gain non-text field types and
  strategy-dispatched filling (previously text-only).

## Impact

- `src/site-adapters/workday/field-map.ts` — typed entries. New
  `src/site-adapters/workday/interactions.ts` (dropdown/multiselect/date/checkbox DOM
  strategies). `index.ts` `plan`/`fill` dispatch by strategy.
- New e2e fixtures + specs for each widget. No manifest/permission changes.
- **Out of scope (later):** multi-step auto-advance, repeatable entries (`add-button`),
  résumé file upload, country/phone-code (needs structured address). `src/core` untouched.
