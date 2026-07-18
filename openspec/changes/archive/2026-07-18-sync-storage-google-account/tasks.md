## 1. Synced storage adapter (edge)

- [x] 1.1 Define chunk keys/size constants in `src/storage/synced-storage-adapter.ts` (`applicant_meta`, `applicant_<n>`, chunk size under 8 KB)
- [x] 1.2 Implement `SyncedStorageAdapter implements StoragePort`; constructor accepts optional `{ onWarning?: (msg: string) => void }`. Compose `LocalStorageAdapter` for the local mirror
- [x] 1.3 `save(data)` — mirror full → `chrome.storage.local`; serialize + chunk full model → `chrome.storage.sync` with meta count; on quota rejection keep local and call `onWarning`
- [x] 1.4 `load()` — reassemble sync chunks when present; fall back to local mirror; both empty → `null`; defensive parse
- [x] 1.5 Stale-chunk cleanup — remove higher-index chunk items when a later save is smaller

## 2. Tests

- [x] 2.1 Mock `chrome.storage.sync` (get/set/remove, array keys) + `chrome.storage.local`
- [x] 2.2 Save mirrors full→local and chunks full→sync (incl. work/education)
- [x] 2.3 Chunked round-trip for data larger than one chunk
- [x] 2.4 Prefer sync over local; fall back to local mirror when sync empty
- [x] 2.5 New-device reconstruction (empty local, sync present) → full model incl. work/education
- [x] 2.6 Stale-chunk cleanup on smaller save; empty→null; quota rejection keeps local + fires `onWarning`

## 3. Panel wiring

- [x] 3.1 Swap `App.tsx` from `LocalStorageAdapter` to `SyncedStorageAdapter`, passing an `onWarning` that shows a non-fatal notice
- [x] 3.2 Render the sync warning inline near Save (non-blocking)

## 4. Verification

- [x] 4.1 `pnpm compile` clean
- [x] 4.2 `pnpm test` green (new synced-storage suite + existing)
- [x] 4.3 `pnpm build` — loadable `.output/`, no new permissions, still no host_permissions
- [ ] 4.4 Manual: save on device A, confirm the full résumé (incl. work/education) appears on device B (same Google profile); oversized data triggers warning but local save persists — **needs user**
- [x] 4.5 Confirm no `src/core/*` imports `chrome.*` / DOM globals
