## MODIFIED Requirements

### Requirement: Normalized website-agnostic data model
The system SHALL define an `ApplicantData` model as a Zod schema with inferred
TypeScript types, containing contact, work history, education, skills, links, and an
`extra` map. The `contact` SHALL include an optional structured `address`
(`line1`, `line2`, `city`, `state`, `postalCode`, `country`, all optional) alongside the
freeform `location`. The model MUST NOT be coupled to any target website, and all new
fields MUST be optional so previously stored data still validates.

#### Scenario: Valid applicant data passes validation
- **WHEN** a well-formed `ApplicantData` object is validated against the schema
- **THEN** validation succeeds and returns the typed object

#### Scenario: Data without a structured address still validates
- **WHEN** an `ApplicantData` with no `contact.address` is validated
- **THEN** validation succeeds (the address is optional)

#### Scenario: Malformed data is rejected
- **WHEN** an object missing required contact fields is validated
- **THEN** validation fails with a descriptive Zod error
