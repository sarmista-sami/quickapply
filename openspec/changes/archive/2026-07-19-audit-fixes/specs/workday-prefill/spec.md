## ADDED Requirements

### Requirement: Auto-fill knows the current value of every field kind
The adapter SHALL report a current value for every mapped field kind — text/textarea
(input value), checkbox (checked state), dropdown (selected option text, with placeholder
treated as empty), multiselect (selected chips), date (year section) — so the empty-only
auto-fill fills each field at most once and never re-interferes with a filled field.

#### Scenario: Filled dropdown is not re-filled
- **WHEN** a dropdown already shows a selected option and an autofill pass runs
- **THEN** the dropdown is skipped and not reopened

#### Scenario: Unfillable field is attempted once per step
- **WHEN** a mapped value has no matching option on the current step
- **THEN** autofill attempts it once and does not retry on subsequent mutations of the
  same step
