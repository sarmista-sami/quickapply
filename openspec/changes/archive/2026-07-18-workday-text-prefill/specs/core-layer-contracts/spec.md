## MODIFIED Requirements

### Requirement: Site adapter contract with plan/fill split
The system SHALL define a `SiteAdapter` interface exposing `matches(url)`,
`plan(data) => FieldFill[]`, and `fill(plan) => Promise<FillResult>`, and a
`WorkdayAdapter` implementing it. Planning MUST be separable from filling, and no
adapter may auto-submit a form.

#### Scenario: Planning is separate from filling
- **WHEN** the adapter interface is used
- **THEN** `plan(data)` returns intended `FieldFill[]` without mutating any page
- **AND** `fill(plan)` is a distinct call that performs the writes

#### Scenario: Workday adapter matches its domains
- **WHEN** `matches` is given a `*.myworkdayjobs.com` or `*.myworkday.com` URL
- **THEN** it returns `true`, and `false` for unrelated domains

#### Scenario: Workday adapter fills text fields without submitting
- **WHEN** `fill` is invoked with a plan of text-field writes
- **THEN** it writes the values via the native setter and does not submit the form
