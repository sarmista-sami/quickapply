# applicant-data-model Specification

## Purpose
The normalized, website-agnostic ApplicantData model (Zod schema + inferred types) shared across all layers, including an `extra` bag for learned non-resume fields and a deliberate exclusion of sensitive (password/payment) fields.
## Requirements
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

