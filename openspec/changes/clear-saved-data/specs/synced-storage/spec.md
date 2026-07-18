## ADDED Requirements

### Requirement: Clear all persisted data
The `SyncedStorageAdapter` SHALL remove all persisted applicant data on `clear()` —
every sync chunk plus its meta, and the local mirror — so a subsequent `load()` returns
`null`.

#### Scenario: Clear removes synced and local data
- **WHEN** data has been saved and `clear()` is called
- **THEN** the sync chunks and meta are removed and the local mirror is removed
- **AND** a subsequent `load()` returns `null`
