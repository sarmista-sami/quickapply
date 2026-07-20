## ADDED Requirements

### Requirement: Name fields are re-cased at fill time
The Workday field map SHALL apply first-letter-capital casing to first/last name values
when resolving them for fill, independent of how the stored value was cased.

#### Scenario: Stale ALL-CAPS name is corrected on fill
- **WHEN** `contact.firstName` is stored as `"PRIYADARSHINI"`
- **THEN** the resolved fill value is `"Priyadarshini"`

### Requirement: Phone fills as a national number when the country is known
The Workday field map SHALL strip a recognized country calling code from the phone digits
before filling `phoneNumber`, using `contact.address.country`, falling back to the
unstripped digits when the country is unknown or unmapped.

#### Scenario: Known country strips its calling code
- **WHEN** `contact.phone` is `"+31 6 8750 8928"` and `contact.address.country` is `"Netherlands"`
- **THEN** the resolved fill value is the national number without the `31` prefix

#### Scenario: Unknown country leaves the digits untouched
- **WHEN** the country is absent or not in the calling-code table
- **THEN** the resolved fill value is the phone digits unchanged
