## Context

The upload pipeline reads the résumé `File` to extract text, then drops it. Workday's file
input is `input[data-automation-id="file-upload-input-ref"]` inside an attachments drop
zone. Constraint: `src/core` stays browser-free; DOM/file work is edge. Never submit.

## Goals / Non-Goals

**Goals:** retain the résumé file locally; attach it to a Workday file input on request.

**Non-Goals:** syncing the file across devices (local only), parsing changes, auto-submit,
multiple attachments.

## Decisions

**Store bytes as base64 in local only.** `chrome.storage` values are JSON, so the file is
kept as `{ name, type, dataBase64 }` under a local key. Local (not sync) because files are
large and sync has a ~100 KB quota; the résumé need not roam. Encoding: `File.arrayBuffer`
→ base64 on save; base64 → `Uint8Array` → `File` on use.

**Populate the input via DataTransfer.** `<input type=file>.files` is read-only to normal
assignment, but assigning a `DataTransfer.files` set is honored in Chrome content scripts.
Build a `DataTransfer`, add the reconstructed `File`, assign `input.files`, then dispatch a
bubbling `change` so the app's handler runs. This mirrors the native-setter approach for
text.

**Separate message, not a FieldFill.** Attaching a file is a distinct action from field
fills, so it uses its own `upload-resume` message rather than overloading `FieldFill`.
The panel loads the stored file and sends it to the active tab's content script.

## Risks / Trade-offs

- [Some sites reject programmatic file assignment] → DataTransfer works in Chrome content
  scripts for standard inputs; if the app ignores it, the handler reports failure and the
  user attaches manually. Never throws.
- [Large résumé in one message] → A few hundred KB base64 in a single runtime message is
  within limits; acceptable for a one-shot action.
- [Stale file after re-upload] → Storing on every successful parse keeps it current.

## Open Questions

- Real Workday may gate the input behind the drop zone / a click on `select-files` first;
  the handler targets the input directly and falls back to reporting failure. Confirm on a
  real page.
