# workday-prefill Specification

## Purpose
TBD - created by archiving change workday-text-prefill. Update Purpose after archive.
## Requirements
### Requirement: Declarative Workday text-field map
The system SHALL maintain a declarative, **typed** map from `ApplicantData` paths to
Workday `data-automation-id` selectors, in the Workday site adapter at the edge. Each entry
declares a field kind (`text`, `textarea`, `checkbox`, `dropdown`, `multiselect`, or
`date`) and how to derive its value(s). The map SHALL cover the account/sign-in email and
the My Information text fields, and MAY cover My Experience fields of any supported kind.
Because the adapter fills only fields present on the page, one map serves every step
without branching.

#### Scenario: Map yields a value for a mapped field
- **WHEN** the map is applied to an `ApplicantData` with a first name
- **THEN** it produces an entry pairing the first-name `data-automation-id` with that value

#### Scenario: Email maps to the account-page field
- **WHEN** the map is applied to an `ApplicantData` with an email
- **THEN** it produces an entry targeting the `formField-email` input

#### Scenario: Entry carries its field kind
- **WHEN** a non-text field (e.g. a dropdown or checkbox) is mapped
- **THEN** its map entry declares the corresponding kind so the adapter can dispatch the
  right fill strategy

#### Scenario: Absent source value produces no fill
- **WHEN** an `ApplicantData` field is empty
- **THEN** the map yields no fill entry for it

### Requirement: Plan reads the page without mutating it
`WorkdayAdapter.plan(data)` SHALL return a `FieldFill[]` for the mapped fields that are
present on the page, each with a label, selector, target value, and current value, and
MUST NOT modify the page.

#### Scenario: Preview reflects present fields only
- **WHEN** `plan` runs on a page containing the email field but not the phone field
- **THEN** the returned plan includes the email fill and omits the phone fill
- **AND** no field value on the page has changed

### Requirement: Fill writes via the native setter and never submits
`WorkdayAdapter.fill(plan)` SHALL write each planned value using the native property
setter and dispatch `input` and `change` events so React-controlled inputs register the
change, waiting for async-loaded fields up to a timeout, and MUST NOT submit the form.

#### Scenario: React-controlled input receives the value
- **WHEN** `fill` targets a controlled input that ignores direct `value` assignment
- **THEN** after the fill the input's committed value equals the planned value

#### Scenario: Missing field is reported, not thrown
- **WHEN** a planned field never appears within the wait timeout
- **THEN** `fill` records it as skipped/errored in the `FillResult` and continues

#### Scenario: No submission occurs
- **WHEN** `fill` completes
- **THEN** no submit/continue button has been activated

### Requirement: Preview-before-fill from the side panel
The extension SHALL fill mapped fields automatically when they are detected on a Workday
page, filling only fields that are currently empty so user input is never overwritten, and
MUST NOT submit or advance the form. The side panel SHALL show the current plan as a review
(current vs new value) and offer a manual "fill now" re-trigger.

#### Scenario: Auto-fill on detection
- **WHEN** a Workday page with mapped empty fields is present and stored `ApplicantData` exists
- **THEN** those fields are filled automatically without a required preview step
- **AND** no submit or continue control is activated

#### Scenario: Existing user input is preserved
- **WHEN** a mapped field already has a value
- **THEN** auto-fill skips it and does not overwrite it

#### Scenario: Panel review and manual refill
- **WHEN** the user opens the panel on a Workday tab
- **THEN** it shows each mapped field's current and new value
- **AND** a manual "fill now" action re-applies the fills

#### Scenario: Non-Workday tab
- **WHEN** the active tab is not a Workday page
- **THEN** the panel indicates there is nothing to fill on this page

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

