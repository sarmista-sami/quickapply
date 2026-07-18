## MODIFIED Requirements

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
