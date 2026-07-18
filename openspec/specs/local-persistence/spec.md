# local-persistence Specification

## Purpose
TBD - created by archiving change parse-docx-resume-preview. Update Purpose after archive.
## Requirements
### Requirement: Local storage adapter implements StoragePort
The system SHALL provide a `LocalStorageAdapter` that implements the core `StoragePort`
interface over `chrome.storage.local`, living at the edge (outside `src/core`). It
serves as a stopgap that Stage 3 replaces with a sync-backed adapter behind the same port.

#### Scenario: Save then load round-trips
- **WHEN** `ApplicantData` is saved through the adapter and later loaded
- **THEN** `load()` returns data equal to what was saved

#### Scenario: Empty state returns null
- **WHEN** `load()` is called and nothing has been saved
- **THEN** it returns `null`

#### Scenario: Panel depends on the port, not the adapter
- **WHEN** the side panel persists or restores data
- **THEN** it does so through the `StoragePort` interface
- **AND** swapping the concrete adapter requires no change to panel logic

