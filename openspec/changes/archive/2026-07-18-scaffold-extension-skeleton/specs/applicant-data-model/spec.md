## ADDED Requirements

### Requirement: Normalized website-agnostic data model
The system SHALL define an `ApplicantData` model as a Zod schema with inferred
TypeScript types, containing contact, work history, education, skills, links, and an
`extra` map. The model MUST NOT be coupled to any target website.

#### Scenario: Valid applicant data passes validation
- **WHEN** a well-formed `ApplicantData` object is validated against the schema
- **THEN** validation succeeds and returns the typed object

#### Scenario: Malformed data is rejected
- **WHEN** an object missing required contact fields is validated
- **THEN** validation fails with a descriptive Zod error

### Requirement: Sensitive fields excluded by design
The `ApplicantData` schema MUST NOT contain fields for passwords or payment details.

#### Scenario: Schema has no sensitive keys
- **WHEN** the schema shape is inspected
- **THEN** it contains no password or payment-related fields
- **AND** name, date of birth, and contact information are permitted

### Requirement: Extra field bag for learned non-resume values
The model SHALL provide an `extra` map of string keys to string values for fields that
do not originate from the resume (e.g. site-specific fields remembered across
applications).

#### Scenario: Extra values round-trip through the schema
- **WHEN** `ApplicantData` with populated `extra` entries is validated
- **THEN** the `extra` entries are preserved on the parsed result
