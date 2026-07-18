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
The side panel SHALL let the user preview the planned fills for the active Workday tab
and then apply them, communicating with the content script via the message protocol.

#### Scenario: Preview then fill
- **WHEN** the user requests a preview on a Workday tab
- **THEN** the panel shows each planned field with its current and new value
- **AND** applying the fill sends a fill request and shows the resulting counts

#### Scenario: Non-Workday tab
- **WHEN** the active tab is not a Workday page
- **THEN** the panel indicates there is nothing to fill on this page

