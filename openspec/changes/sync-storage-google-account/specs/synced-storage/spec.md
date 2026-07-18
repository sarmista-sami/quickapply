## ADDED Requirements

### Requirement: Full model roams via the Google account
The system SHALL persist the full `ApplicantData` to `chrome.storage.sync` (roaming via
the signed-in Chrome profile's Google account) and mirror it to `chrome.storage.local`,
through a `SyncedStorageAdapter` that implements the core `StoragePort`. Because sync
caps each item at ~8 KB, the serialized model MUST be split into chunk items with a
count. The adapter MUST live at the edge (outside `src/core`).

#### Scenario: Save mirrors to local and chunks the full model to sync
- **WHEN** the user saves reviewed `ApplicantData`
- **THEN** the full object is written to `chrome.storage.local`
- **AND** the serialized model is written to `chrome.storage.sync` as chunk items plus a
  chunk count, including `work` and `education`

#### Scenario: Large data spans multiple chunks and round-trips
- **WHEN** the serialized model is larger than one chunk
- **THEN** it is stored across multiple chunk items
- **AND** loading reassembles the chunks into the original `ApplicantData`

### Requirement: Prefer sync on load with local fallback
The system SHALL load by reassembling the sync chunks when present, and fall back to the
local mirror when sync is empty or unavailable.

#### Scenario: Sync present is preferred
- **WHEN** both sync chunks and a local mirror exist
- **THEN** the loaded data comes from the reassembled sync chunks

#### Scenario: Fallback to local mirror
- **WHEN** sync holds no data but the local mirror exists
- **THEN** `load()` returns the local mirror

#### Scenario: New device reconstructs the full model
- **WHEN** `load()` runs on a fresh install (empty local) with sync chunks present
- **THEN** it returns the full `ApplicantData`, including `work` and `education`

#### Scenario: Nothing stored returns null
- **WHEN** neither sync nor local holds saved data
- **THEN** `load()` returns `null`

### Requirement: Stale-chunk cleanup
The system SHALL remove chunk items left over from a previous, larger save so that
reassembly never includes stale tail data.

#### Scenario: Smaller save prunes old chunks
- **WHEN** a save produces fewer chunks than the previous save
- **THEN** the now-unused higher-index chunk items are removed
- **AND** loading returns only the latest saved data

### Requirement: Quota-safe save
The system SHALL not lose data when the sync write exceeds a byte quota. The local mirror
MUST still succeed and the failure MUST be surfaced as a non-fatal warning.

#### Scenario: Sync write over quota
- **WHEN** saving and the sync write rejects with a quota error
- **THEN** the full data remains saved in the local mirror
- **AND** the adapter reports a non-fatal warning that the data was not synced
