## Why

Stage 1 shipped empty layer stubs. Users can't yet do anything. Stage 2 delivers the
first real value: upload a docx résumé, extract fields into the normalized model, and
let the user review and correct them in the side panel before anything is trusted.

## What Changes

- Add docx text extraction at the edge (`src/parsers/docx/`) using **mammoth**
  (`File → arrayBuffer → extractRawText → string`), keeping browser coupling out of core.
- Implement the core **parser** (`parse(text, meta) → RawResume`) — pure, heuristic:
  high-confidence regex for email, phone, URLs/links, and a best-effort name guess;
  best-effort section segmentation (Experience / Education / Skills) by heading detection.
- Implement the core **normalizer** (`normalize(raw) → ApplicantData`).
- Add a side-panel **upload → preview** flow: file picker (`.docx`), then an editable,
  grouped preview (contact / work / education / skills / links / extra) with inline Zod
  validation. Nothing is auto-trusted — the user edits everything.
- Add a **`LocalStorageAdapter`** (edge) implementing the existing `StoragePort` over
  `chrome.storage.local` as a stopgap; Stage 3 swaps in `chrome.storage.sync`. On open,
  if saved data exists, load it instead of forcing re-upload.
- Sample-text **fixtures + Vitest** for parser and normalizer.

Parsing is deliberately pragmatic: reliable fields auto-extracted, fuzzy structure
left for the human to fix. No aggressive auto-structuring.

## Capabilities

### New Capabilities
- `resume-parsing`: docx text extraction plus the core parse/normalize pipeline that
  turns résumé text into a validated `ApplicantData` (regex-reliable fields + best-effort
  sections).
- `resume-preview`: the side-panel upload-and-review UI — editable grouped fields with
  inline validation, load-existing-on-open, and save.
- `local-persistence`: a `StoragePort` implementation over `chrome.storage.local` for
  saving/loading `ApplicantData` (Stage-3 sync swaps in behind the same port).

### Modified Capabilities
- `core-layer-contracts`: the Parser and Normalizer requirements change from
  "stub throws NotImplemented" to defined runtime behavior.

## Impact

- New deps: `mammoth`. New edge modules: `src/parsers/docx/`, `src/storage/local-storage-adapter.ts`.
- Implemented: `src/core/parser`, `src/core/normalizer`. New side-panel components under
  `entrypoints/sidepanel/`.
- Parser signature refined to `parse(text: string, meta) => RawResume` (text in, not
  `File`) so core stays browser-free; the edge does file reading. Updates the Stage-1
  contract accordingly.
- No new manifest permissions (`storage` already granted; local uses it). Still no
  `host_permissions`.
