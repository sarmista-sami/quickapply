# core-layer-contracts Specification

## Purpose
The typed interface contracts for the parser, normalizer, storage-port, and site-adapter layers (including the plan/fill split), locking layer boundaries so later stages fill in implementations against fixed, testable interfaces.
## Requirements
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

### Requirement: Applicant-data storage port
The system SHALL define a `StoragePort` interface with `load(): Promise<ApplicantData |
null>` and `save(data: ApplicantData): Promise<void>`, plus a `SyncStorageAdapter` stub
that will implement it over `chrome.storage`.

#### Scenario: Storage adapter stub is reachable but unimplemented
- **WHEN** the sync storage adapter's `load` or `save` is invoked
- **THEN** it throws a `NotImplemented` error
- **AND** the `StoragePort` interface itself contains no browser types in `src/core`

### Requirement: Site adapter contract with plan/fill split
The system SHALL define a `SiteAdapter` interface exposing `matches(url)`,
`plan(data) => FieldFill[]`, and `fill(plan) => Promise<FillResult>`, and a
`WorkdayAdapter` stub implementing it. Planning MUST be separable from filling, and no
adapter may auto-submit a form.

#### Scenario: Planning is separate from filling
- **WHEN** the adapter interface is used
- **THEN** `plan(data)` returns intended `FieldFill[]` without mutating any page
- **AND** `fill(plan)` is a distinct call that performs the writes

#### Scenario: Workday adapter stub is reachable but unimplemented
- **WHEN** the Workday adapter's `plan` or `fill` is invoked
- **THEN** it throws a `NotImplemented` error

