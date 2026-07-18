## 1. Port + adapters

- [x] 1.1 Add `clear(): Promise<void>` to `StoragePort`
- [x] 1.2 Implement `clear` in `SyncedStorageAdapter` (remove chunks + meta from sync, remove local mirror)
- [x] 1.3 Implement `clear` in `LocalStorageAdapter`; add `clear` to `ResumeFileStore`
- [x] 1.4 Remove obsolete `src/storage/sync-storage-adapter.ts` + its test

## 2. Panel

- [x] 2.1 "Clear saved data" action (confirm) in the panel — clears both stores, returns to upload

## 3. Tests + verification

- [x] 3.1 Synced adapter test: save → clear → load returns null; sync + local emptied
- [x] 3.2 ResumeFileStore test: save → clear → load null
- [x] 3.3 `pnpm compile` / `pnpm test` / `pnpm e2e` / `pnpm build` green
- [x] 3.4 No `src/core/*` chrome/DOM imports
