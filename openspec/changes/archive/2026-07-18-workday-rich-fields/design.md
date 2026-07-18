## Context

4a proved the text native-setter path and the plan/preview/fill flow. The captured DOM
(`docs/workday-dom-reference.md`) shows the remaining widgets: custom dropdowns
(`button` + option list), chip multiselects, date section spinners, and native checkboxes.
Constraint: DOM interaction stays in the edge Workday adapter; `src/core` untouched; never
submit. Live widget behavior can't be validated from the build env — fixtures model the
captured markup and a real-page pass is a manual task.

## Goals / Non-Goals

**Goals:** fill checkbox, dropdown, multiselect, and date fields from `ApplicantData`;
preview each as a `FieldFill`; robust to missing options (report, don't throw).

**Non-Goals:** multi-step auto-advance, repeatable entries (`add-button`), résumé upload,
country/phone-code dropdowns (need structured address), perfect parity with every tenant's
custom widget.

## Decisions

**Typed field map + strategy dispatch.** Each map entry declares a `kind`
(`text|textarea|checkbox|dropdown|multiselect|date`) and how to derive its value(s) from
`ApplicantData`. `plan()` emits `FieldFill{ strategy, value }` (multiselect carries the
list joined for preview); `fill()` switches on strategy to the matching interaction. This
keeps one map as the source of truth and the preview honest.

**Dropdown interaction.** Click `[data-automation-id="formField-<X>"] button`, wait for the
option list to render, then click the `[data-automation-id="promptOption"]` whose trimmed
text case-insensitively equals (or, failing that, contains) the target. If the widget has a
search input, type the value first to filter. Options may render in a portal at document
root, so the option query is document-wide, scoped by visibility/timing, not by the wrapper.

**Multiselect.** For each value: focus the container's input, type the value, wait for
options, click the match; verify a chip (`selectedItem`) appeared. Accumulate; report
values with no matching option as skipped.

**Date.** Workday splits dates into `dateSectionMonth-input` / `dateSectionYear-input`
(and `-Day` when present) spinbuttons. Parse the model's `YYYY-MM` (best-effort) and write
each section via the native setter + events.

**Checkbox.** If desired state differs from current, click (or set `checked` + dispatch)
so controlled state updates; e.g. `currentlyWorkHere` from `work[].current`.

**Timeouts & failures.** Every interaction waits with a bounded timeout and records
`skipped`/`errors` in `FillResult` rather than throwing, so one bad field never aborts the
batch. No interaction targets a submit/continue control.

## Risks / Trade-offs

- [Live widget differs from fixture] → Strategies use tolerant matching (equals→contains,
  document-wide option search, waits); real-page confirmation is an explicit manual task.
- [Wrong option selected by loose matching] → Prefer exact case-insensitive equality first;
  only fall back to contains; log the chosen text in the result for auditing.
- [Date formats vary] → Parse defensively; if month/year can't be derived, skip the date
  and report it, never write garbage.

## Open Questions

- Whether skills should map to Workday's typeahead when an exact skill option doesn't exist
  (Workday sometimes allows free-add). Start with exact-match; revisit against a real page.
