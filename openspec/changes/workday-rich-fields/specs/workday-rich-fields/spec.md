## ADDED Requirements

### Requirement: Fill checkbox fields
The adapter SHALL set Workday checkbox fields (e.g. `currentlyWorkHere`) to match the
source boolean, dispatching events so controlled state updates, and only when the desired
state differs from the current state.

#### Scenario: Checkbox set to match source
- **WHEN** the source indicates a current role and the checkbox is unchecked
- **THEN** after fill the checkbox is checked and its change event has fired

### Requirement: Fill custom dropdown fields
The adapter SHALL fill Workday custom dropdowns (e.g. `degree`) by opening the field and
selecting the option whose text matches the target value, preferring exact
case-insensitive equality and falling back to a contains match.

#### Scenario: Dropdown option selected
- **WHEN** the target value equals a listed option's text
- **THEN** the adapter opens the dropdown and selects that option

#### Scenario: No matching option
- **WHEN** no option matches the target value
- **THEN** the field is reported as skipped in the result and no option is selected

### Requirement: Fill multiselect fields
The adapter SHALL fill Workday multiselect fields (e.g. `skills`) by adding each source
value that matches an available option, accumulating selections, and reporting values with
no matching option as skipped.

#### Scenario: Multiple values added
- **WHEN** the source lists several skills that exist as options
- **THEN** each matching skill is added as a selected chip

### Requirement: Fill date fields
The adapter SHALL fill Workday date fields (e.g. work start/end) by writing the month and
year (and day when present) section inputs via the native setter, parsing the source date
best-effort and skipping when it cannot be parsed.

#### Scenario: Month and year written
- **WHEN** the source date yields a month and year
- **THEN** the corresponding date section inputs receive those values

#### Scenario: Unparseable date skipped
- **WHEN** the source date cannot be parsed into month/year
- **THEN** the date field is skipped and reported, and nothing is written

### Requirement: Strategy dispatch and no submission
`plan()` SHALL tag each `FieldFill` with its strategy and `fill()` SHALL dispatch to the
matching interaction. Any field whose interaction fails or times out MUST be recorded in
the `FillResult` without aborting the batch, and no interaction may submit or advance the
form.

#### Scenario: One failing field does not abort the batch
- **WHEN** one mapped field's interaction fails
- **THEN** the remaining fields are still filled and the failure is recorded

#### Scenario: No submission
- **WHEN** fill completes with any mix of field kinds
- **THEN** no submit or continue control has been activated
