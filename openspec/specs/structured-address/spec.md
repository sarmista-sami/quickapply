# structured-address Specification

## Purpose
TBD - created by archiving change structured-address. Update Purpose after archive.
## Requirements
### Requirement: Editable structured address in the preview
The side-panel preview SHALL let the user view and edit the structured address fields
(line 1, line 2, city, state, postal code, country), which persist and sync with the rest
of `ApplicantData`.

#### Scenario: User edits an address field
- **WHEN** the user changes the city in the preview
- **THEN** the change is reflected in the working `ApplicantData` and saved with it

### Requirement: Workday address fill from the structured address
The Workday map SHALL fill `addressLine1` (from `address.line1`, falling back to
`location`), `city`, `postalCode`, and the `country` dropdown from the structured address,
using the existing fill strategies.

#### Scenario: Address fields resolve from the structured address
- **WHEN** the applicant has a structured address with city and postal code
- **THEN** the map yields fills for the corresponding Workday fields

#### Scenario: Country uses the dropdown strategy
- **WHEN** the applicant has a country
- **THEN** the `country` field is mapped with the dropdown strategy

#### Scenario: Address line falls back to freeform location
- **WHEN** `address.line1` is empty but `location` is set
- **THEN** `addressLine1` is filled from `location`

