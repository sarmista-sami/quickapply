# resume-parsing Specification

## Purpose
TBD - created by archiving change parse-docx-resume-preview. Update Purpose after archive.
## Requirements
### Requirement: docx text extraction at the edge
The system SHALL extract plain text from an uploaded résumé at the edge (outside
`src/core`): `.docx` via mammoth and `.pdf` via pdf.js. Extraction MUST accept the file as
an `ArrayBuffer` and return plain text for the core parser. Unsupported formats are not
extracted.

#### Scenario: docx is read into text
- **WHEN** a user selects a `.docx` résumé
- **THEN** the edge extractor reads it via `mammoth.extractRawText` and yields plain text
- **AND** this text is passed to the core `parse` function

#### Scenario: pdf is read into text
- **WHEN** a user selects a `.pdf` résumé
- **THEN** the edge extractor reads it via pdf.js and yields plain text
- **AND** this text is passed to the core `parse` function

#### Scenario: Unsupported input is rejected
- **WHEN** a user selects a file that is neither `.docx` nor `.pdf`
- **THEN** extraction is not attempted and the user is shown an unsupported-format message

### Requirement: Résumé text to validated ApplicantData
The system SHALL turn extracted résumé text into an `ApplicantData` value by running the
core parser then normalizer, and validating the result against `ApplicantDataSchema`.

#### Scenario: End-to-end parse yields validated data
- **WHEN** résumé text is parsed and normalized
- **THEN** the resulting `ApplicantData` passes Zod validation before it reaches the preview

#### Scenario: Reliable fields are auto-filled, structure is best-effort
- **WHEN** the résumé contains a clear email, phone, and profile links
- **THEN** those fields are populated with high confidence
- **AND** work/education entries are populated on a best-effort basis for the user to correct

### Requirement: Extract work and education dates
The normalizer SHALL parse start and end dates from work and education entry text in
common résumé formats, output them as `YYYY` or `YYYY-MM`, and set the current-role flag
when the end is expressed as "Present"/"Current".

#### Scenario: Year range parsed
- **WHEN** a work entry contains "2018 – 2020"
- **THEN** the work item's `startDate` is `2018` and `endDate` is `2020`

#### Scenario: Month-year with present
- **WHEN** a work entry contains "Jan 2019 - Present"
- **THEN** `startDate` is `2019-01`, `current` is true, and `endDate` is unset

#### Scenario: No date leaves fields empty
- **WHEN** a work entry has no recognizable date
- **THEN** `startDate` is empty and `current` is false, with no invented date

