## MODIFIED Requirements

### Requirement: Parser layer contract
The system SHALL provide a pure parser layer that exposes
`parse(text: string, meta: { sourceName: string; format: 'docx' }) => RawResume`,
independent of the browser (no `chrome.*` or DOM APIs). It extracts high-confidence
fields and best-effort sections from résumé text. Reading the file and extracting text
from docx is done at the edge and is NOT part of the core parser.

#### Scenario: Parser extracts reliable contact fields
- **WHEN** `parse` is given text containing an email address, a phone number, and a
  LinkedIn URL
- **THEN** it returns a `RawResume` whose detected fields include that email, phone, and
  a link classified as LinkedIn

#### Scenario: Parser segments sections best-effort
- **WHEN** `parse` is given text with an "Experience" heading followed by role entries
- **THEN** the returned `RawResume` groups the following blocks under a work section
- **AND** text under no recognized heading is preserved as unclassified blocks

#### Scenario: Parser stays browser-free
- **WHEN** the parser module is imported
- **THEN** it references no `chrome.*` or DOM globals and runs under Vitest in node

### Requirement: Normalizer layer contract
The system SHALL provide a normalizer that exposes `normalize(raw: RawResume) =>
ApplicantData`, mapping the parser output to the normalized model and applying schema
defaults. It MUST be pure and browser-free.

#### Scenario: Normalizer produces valid ApplicantData
- **WHEN** `normalize` is given a `RawResume` with detected contact fields and one work
  section entry
- **THEN** it returns an object that passes `ApplicantDataSchema` validation
- **AND** absent optional collections default to empty arrays / empty `extra`
