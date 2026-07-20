## Context

`selectMultiple` types a value (native setter → input event), waits for a
`promptOption`, and clicks it. On real Workday the click doesn't commit the skill — the
prompt commits on **Enter** — and when our option query misses, the 3 s wait per skill
makes it slow. Separately, Workday renders a repeatable section's fields only after its
"Add" button is clicked, so education fields are absent until then. Constraints unchanged:
edge-only DOM, never submit, empty-only autofill.

## Goals / Non-Goals

**Goals:** commit skills reliably (Enter + chip confirmation, faster); auto-add
education/work sections so their fields exist to fill.
**Non-Goals:** filling multiple repeatable entries (still first entry only); a submit path.

## Decisions

**Chip-confirmed Enter commit for multiselect.** For each value: focus the input, set the
value (native setter + input event to trigger the search), then click a matching option if
one appears within a short timeout, else dispatch a real **Enter** keydown/keyup on the
input. Success is measured by a new `selectedItem` chip appearing inside the wrapper
(count before/after), not by whether we found an option — so both the click and Enter
paths are covered and genuinely-unavailable skills are reported. Shorter option timeout
(1.2 s) keeps misses from stalling.

**`pressEnter(el)`.** A dom helper dispatching `keydown` + `keyup` with `key/code = Enter`
(and `keyCode/which = 13` for handlers that still read them), bubbling.

**Section prepare via nearest-heading match.** `clickAddForSection(nameRe)` finds
`button[data-automation-id="add-button"]`, and for each walks up a few ancestors looking
for a heading/label whose text matches the section name; the first match is clicked. The
Workday adapter gains `prepare(data)`: when there's education data but no education field
(`formField-degree` / `formField-firstYearAttended`) is present, click the Education
"Add"; same defensive check for work. `prepare` only clicks while the field is absent, so
it self-limits to once (the added field then exists on subsequent passes). `SiteAdapter`
gets an optional `prepare?(data)`, called by `autofillEmpty` before planning.

## Risks / Trade-offs

- [Enter could do more than commit on some prompts] → It's dispatched on the multiselect
  search input only, never on a form/submit control; Workday prompts treat Enter as
  "accept highlighted option".
- [`clickAddForSection` matches the wrong section] → Match requires a heading text hit
  within a few ancestors of an add-button; worst case an extra empty entry is added (never
  submitted). Only invoked when the section's field is genuinely absent.
- [Heading structure differs per tenant] → Best-effort; if no match, nothing is clicked
  and the field simply isn't filled (previous behavior, not a regression).

## Open Questions

- Exact education field/heading markup varies by tenant; the checks use the captured
  `formField-degree`/`formField-firstYearAttended` ids and a loose heading match.
