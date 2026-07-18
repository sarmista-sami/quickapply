# resume-preview Specification

## Purpose
TBD - created by archiving change parse-docx-resume-preview. Update Purpose after archive.
## Requirements
### Requirement: Upload résumé from the side panel
The side panel SHALL let the user select a `.docx` résumé to parse when no saved data
exists, or when they choose to replace existing data.

#### Scenario: First-time user uploads
- **WHEN** the side panel opens and no saved `ApplicantData` exists
- **THEN** it presents a file picker restricted to `.docx`

#### Scenario: Returning user sees saved data
- **WHEN** the side panel opens and saved `ApplicantData` exists
- **THEN** it loads and displays that data instead of forcing a new upload
- **AND** the user may still choose to upload a new résumé

### Requirement: Editable, validated preview
The side panel SHALL display the parsed `ApplicantData` as an editable, grouped preview
(contact, work, education, skills, links, extra) with inline validation, so the user
reviews and corrects every field before it is trusted.

#### Scenario: User edits a field
- **WHEN** the user changes a field value in the preview
- **THEN** the change is reflected in the working `ApplicantData` state

#### Scenario: Invalid input is flagged inline
- **WHEN** the user enters a value that violates the schema (e.g. a malformed email)
- **THEN** an inline validation error is shown for that field
- **AND** saving is prevented until the data is valid

### Requirement: Save reviewed data
The side panel SHALL persist the reviewed `ApplicantData` via the storage port when the
user saves.

#### Scenario: Successful save
- **WHEN** the user saves valid reviewed data
- **THEN** it is written through the storage port and survives reopening the panel

