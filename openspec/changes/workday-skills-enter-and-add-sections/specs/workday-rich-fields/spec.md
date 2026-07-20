## MODIFIED Requirements

### Requirement: Fill multiselect fields
The adapter SHALL fill Workday multiselect fields (e.g. `skills`) by adding each source
value that the widget accepts — clicking a matching option when one appears, otherwise
pressing Enter to commit the highlighted suggestion — and SHALL confirm each addition by
detecting a new selected chip, reporting values that produced no chip as skipped.

#### Scenario: Value committed via Enter
- **WHEN** a typed skill matches a suggestion that only commits on Enter
- **THEN** the adapter presses Enter and a selected chip is added

#### Scenario: Multiple values added
- **WHEN** the source lists several skills the widget accepts
- **THEN** each is added as a selected chip

#### Scenario: Unavailable value reported
- **WHEN** a typed skill never produces a chip
- **THEN** it is reported as skipped
