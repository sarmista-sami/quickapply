## ADDED Requirements

### Requirement: Parser layer contract
The system SHALL define a parser layer that exposes `parse(file) => Promise<RawResume>`,
independent of the browser. In this change the implementation is a stub.

#### Scenario: Parser stub is reachable but unimplemented
- **WHEN** the parser stub is invoked
- **THEN** it throws a `NotImplemented` error
- **AND** the parser module imports no `chrome.*` or DOM APIs

### Requirement: Normalizer layer contract
The system SHALL define a normalizer that exposes `normalize(raw: RawResume) =>
ApplicantData`, mapping format-specific input to the normalized model.

#### Scenario: Normalizer stub is reachable but unimplemented
- **WHEN** the normalizer stub is invoked
- **THEN** it throws a `NotImplemented` error

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
