## ADDED Requirements

### Requirement: Prepare repeatable sections before filling
The adapter SHALL, before filling, reveal a repeatable section's fields when the applicant
has data for it but the fields are absent, by clicking that section's "Add" control
(identified by its nearby section heading). It MUST only do so while the fields are absent
(so it acts once) and MUST NOT submit the form.

#### Scenario: Education fields added when absent
- **WHEN** the applicant has education data and no education field is present on the page
- **THEN** the adapter clicks the Education "Add" control so the fields render

#### Scenario: No action when fields already present
- **WHEN** the education fields are already present
- **THEN** the adapter does not click "Add" again
