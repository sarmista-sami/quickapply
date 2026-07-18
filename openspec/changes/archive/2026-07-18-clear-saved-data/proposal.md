## Why

Users need a way to wipe their stored résumé data (e.g. wrong résumé, shared machine, or a
fresh start). There is currently no clear/reset path, and the obsolete Stage-1
`SyncStorageAdapter` stub still lingers as dead code.

## What Changes

- Add `clear(): Promise<void>` to the `StoragePort` interface; implement it in
  `SyncedStorageAdapter` (remove all sync chunks + meta and the local mirror) and
  `LocalStorageAdapter`.
- Add `clear()` to `ResumeFileStore` (remove the stored résumé file).
- Side panel: a "Clear saved data" action (with confirm) that clears both stores and
  returns to the upload screen.
- Remove the superseded `SyncStorageAdapter` stub and its test (replaced by
  `SyncedStorageAdapter` in Stage 3).

## Capabilities

### Modified Capabilities
- `core-layer-contracts`: `StoragePort` gains `clear()`; the obsolete stub requirement is
  dropped.
- `synced-storage`: the adapter can clear all persisted data.

## Impact

- `src/core/applicant-data/storage-port.ts`, `src/storage/synced-storage-adapter.ts`,
  `src/storage/local-storage-adapter.ts`, `src/storage/resume-file-store.ts`, panel.
  Removes `src/storage/sync-storage-adapter.ts` + test. No permission changes.
