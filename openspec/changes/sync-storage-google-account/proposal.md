## Why

Stage 2 saves reviewed data to `chrome.storage.local` — it stays on one device. Users
expect all of their résumé details (including work history and education, plus the
cross-company values they've corrected) to follow them across machines via their Google
account. Roaming everything is also the foundation for the Stage-4 prefill on any device.

## What Changes

- Add a `SyncedStorageAdapter` (edge) implementing the existing `StoragePort`:
  - **save**: mirror the full `ApplicantData` to `chrome.storage.local`, then roam the
    full model via `chrome.storage.sync`. Because sync caps each item at ~8 KB, the
    serialized data is split into character **chunks** (`applicant_0`, `applicant_1`, …)
    with an `applicant_meta` count. On a quota failure the local mirror is kept and a
    non-fatal warning is surfaced.
  - **load**: prefer sync (reassemble the chunks → full model); fall back to the local
    mirror when sync is empty or offline. Nothing stored → `null`.
- Stale-tail cleanup: a smaller save removes leftover chunk items from a previous larger
  save so the reassembly stays correct.
- Swap the side panel from `LocalStorageAdapter` to `SyncedStorageAdapter` (one line —
  the `StoragePort` contract makes this transparent).
- Tests for chunked round-trip, mirror/fallback, new-device reconstruction, stale-chunk
  cleanup, empty→null, and quota fallback.

`chrome.storage.sync` roams via the signed-in Chrome profile's Google account — no OAuth
or extra permissions. The whole model roams, bounded by sync's ~100 KB total quota;
beyond that the quota fallback keeps data safe locally and warns.

## Capabilities

### New Capabilities
- `synced-storage`: persistence that roams the full `ApplicantData` via
  `chrome.storage.sync` (chunked to beat the per-item byte cap) with a local mirror for
  offline/fallback reads, prefer-sync load, stale-chunk cleanup, and quota-safe fallback.

### Modified Capabilities
<!-- none — the StoragePort contract and local-persistence requirements are unchanged;
     the panel simply depends on a different concrete adapter. -->

## Impact

- New edge module: `src/storage/synced-storage-adapter.ts` (+ tests). Composes the
  existing `LocalStorageAdapter` for the local mirror.
- `entrypoints/sidepanel/App.tsx`: one-line adapter swap; a small warning surface for
  quota fallback.
- No new manifest permissions (`storage` already covers `sync`). Still no `host_permissions`.
- `src/core` untouched.
