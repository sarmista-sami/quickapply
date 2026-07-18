## 1. Résumé file store (local)

- [x] 1.1 `src/storage/resume-file-store.ts` — `StoredResume { name; type; dataBase64 }`; `save(file: File)`, `load(): Promise<File | null>`; base64 encode/decode; local-only key
- [x] 1.2 Unit test: save→load round-trips name/type/bytes (mock chrome.storage.local)

## 2. Pipeline stores the file

- [x] 2.1 After a successful parse, store the résumé file via the store (in `Upload` or pipeline)

## 3. Workday attach

- [x] 3.1 `src/site-adapters/workday/resume-upload.ts` — `attachResume(file: File): boolean` finds `input[type=file]` (prefer `file-upload-input-ref`), sets via `DataTransfer`, dispatches change; never submit
- [x] 3.2 Protocol: `UploadResumeRequest { file: {name,type,dataBase64} }` / `UploadResumeResponse { ok; error? }`; content-script handler decodes + calls `attachResume`
- [x] 3.3 Panel: "Attach résumé to this page" button in `FillPage` — load stored file, send request, show result

## 4. e2e + verification

- [x] 4.1 e2e fixture with `file-upload-input-ref` file input; spec sets a file via `attachResume`, asserts `input.files[0].name` + change fired; no submit
- [x] 4.2 `pnpm compile` / `pnpm test` / `pnpm e2e` / `pnpm build` green; no new permissions
- [x] 4.3 No `src/core/*` chrome/DOM imports
- [ ] 4.4 Manual (real Workday): attach résumé on My Experience; file appears; no submit — **needs user**
