## MODIFIED Requirements

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
