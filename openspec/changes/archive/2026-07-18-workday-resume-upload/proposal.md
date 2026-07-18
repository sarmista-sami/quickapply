## Why

Workday's My Experience step has a résumé file upload (`file-upload-input-ref`). The
extension already ingests the user's résumé file to parse it, but then discards it. Keeping
the original file lets the extension attach it to the application in one click.

## What Changes

- Persist the original résumé file (name, MIME type, bytes) in `chrome.storage.local`
  (local only — not synced; too large for sync and unnecessary to roam).
- After a successful parse, store the file automatically.
- Add a message + content-script handler to set a stored file into a Workday file input
  via `DataTransfer` (the reliable way to populate `<input type=file>` programmatically),
  dispatching `change` so the app registers it.
- Side panel: an "Attach résumé to this page" action that loads the stored file and sends
  it; shows success/failure. Never submits.

## Capabilities

### New Capabilities
- `resume-file-upload`: retain the original résumé file locally and attach it to a Workday
  file input on request.

### Modified Capabilities
<!-- none — additive; existing capabilities unchanged -->

## Impact

- New `src/storage/resume-file-store.ts` (local-only), `src/site-adapters/workday/resume-upload.ts`
  (DataTransfer set), protocol message + content handler, panel button.
- Storage: résumé bytes live only in `chrome.storage.local`; the synced `ApplicantData` is
  unchanged (no size impact on sync). No manifest/permission changes. `src/core` untouched.
