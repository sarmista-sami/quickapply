## MODIFIED Requirements

### Requirement: Applicant-data storage port
The system SHALL define a `StoragePort` interface with `load(): Promise<ApplicantData |
null>`, `save(data: ApplicantData): Promise<void>`, and `clear(): Promise<void>`. The
interface MUST contain no browser types in `src/core`; concrete adapters live at the edge.

#### Scenario: Port exposes load, save, and clear
- **WHEN** the `StoragePort` interface is used
- **THEN** it provides `load`, `save`, and `clear` and references no browser types in `src/core`
