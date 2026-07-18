# resume-parsing Specification

## Purpose
TBD - created by archiving change parse-docx-resume-preview. Update Purpose after archive.
## Requirements
### Requirement: docx text extraction at the edge
The system SHALL extract plain text from an uploaded `.docx` file using mammoth, in an
edge module outside `src/core`. The extraction MUST accept the file as an `ArrayBuffer`
and return plain text for the core parser.

#### Scenario: docx is read into text
- **WHEN** a user selects a `.docx` résumé
- **THEN** the edge extractor reads it via `mammoth.extractRawText` and yields plain text
- **AND** this text is passed to the core `parse` function

#### Scenario: Non-docx input is rejected
- **WHEN** a user selects a file whose type is not `.docx`
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

