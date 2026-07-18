## Context

`StoragePort` (in `src/core`) has `load`/`save`. The Stage-1 `SyncStorageAdapter` stub is
dead (superseded by `SyncedStorageAdapter`). Résumé bytes live in `ResumeFileStore`
(local). Constraint: `StoragePort` stays browser-free.

## Goals / Non-Goals

**Goals:** one-call clear of all persisted applicant data (synced + local + résumé file);
remove dead code.

**Non-Goals:** selective/partial clears; undo.

## Decisions

**`clear()` on `StoragePort`.** Clearing is a storage responsibility, so it belongs on the
port. `SyncedStorageAdapter.clear` reads the chunk meta, removes `applicant_<0..n>` +
`applicant_meta` from sync, and removes the local mirror key. `LocalStorageAdapter.clear`
removes its single key. `ResumeFileStore.clear` removes the résumé key (separate store,
not part of `ApplicantData`).

**Confirm in the UI.** The panel guards the action behind a confirm and then resets React
state to the upload screen. The résumé file store is cleared alongside.

**Delete the stub.** The obsolete `SyncStorageAdapter` and its test are removed; the
`core-layer-contracts` storage-port requirement is updated to describe `load/save/clear`
without the stub.

## Risks / Trade-offs

- [Accidental data loss] → Confirm gate; clear only runs on explicit user action.
- [Partial clear on a failing key] → Each removal is awaited; a failure surfaces but the
  local/résumé removals still run so nothing is half-trusted silently.

## Open Questions

- None.
