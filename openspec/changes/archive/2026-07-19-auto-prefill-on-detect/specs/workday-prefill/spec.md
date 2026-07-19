## MODIFIED Requirements

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
