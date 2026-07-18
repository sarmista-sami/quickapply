## Context

Stage 1 locked the layer contracts; parser/normalizer are stubs. This change implements
the docx path and the review UI. Constraints from `AGENTS.md`: core stays browser-free
and website-agnostic; no sensitive fields; validate with Zod. Résumés are unstructured,
so extraction cannot be fully reliable — the design leans on human review.

## Goals / Non-Goals

**Goals:**
- Upload a `.docx`, get a validated `ApplicantData`, edit it, and persist it locally.
- Keep docx/browser coupling at the edge; parser/normalizer remain pure and unit-tested.
- High-confidence auto-fill of contact/links; best-effort work/education; user edits all.

**Non-Goals:**
- PDF parsing, `chrome.storage.sync`, Workday form-filling, aggressive auto-structuring,
  parsing accuracy guarantees.

## Decisions

**mammoth at the edge, parser on text.** The Stage-1 contract `parse(file: File)` is
refined to `parse(text: string, meta: { sourceName: string; format: 'docx' }) =>
RawResume`. File reading + mammoth `extractRawText` live in `src/parsers/docx/` (edge);
the core parser only sees text, so it runs in node under Vitest with no browser shim.
Alternative (mammoth inside core) risks a DOM dependency and couples core to a docx lib.

**Heuristic, layered extraction.** Parser splits text into lines/blocks, then:
1. Reliable regex — email, phone (loose international), URLs (classify github/linkedin/
   other), name (first non-empty line that isn't contact info).
2. Section segmentation — locate heading lines matching Experience/Work, Education,
   Skills; slice following blocks into rough entries. Anything unmatched becomes
   free-text the user can move. Produces `RawResume` (typed blocks + detected fields).
Normalizer maps `RawResume` → `ApplicantData`, applying schema defaults.

**LocalStorageAdapter behind StoragePort.** Same interface the Stage-3 sync adapter will
use. Side panel depends on `StoragePort`, not on a concrete adapter, so Stage 3 is a
one-line swap. On mount the panel calls `load()`; if non-null, show it; else show upload.

**Preview = controlled React form over ApplicantData.** Each field group renders editable
rows; edits update local state; the whole object is re-validated with the Zod schema on
change to surface inline errors. Save calls `StoragePort.save()` after a successful parse.

## Risks / Trade-offs

- [Heuristic parsing is wrong on many layouts] → Scope explicitly makes the user the
  source of truth; auto-extraction is a convenience, not a contract. Only email/phone/
  links aim for high precision.
- [mammoth pulls in a large dep / browser assumptions] → Only `extractRawText` is used;
  measure bundle impact in the build step. Isolated at the edge so it never leaks to core.
- [chrome.storage.local size limits] → `ApplicantData` is small text; well under limits.
  Sync (Stage 3) has stricter per-item limits — noted for later, not this change.
- [Contract change ripples to Stage-1 tests] → Update the parser stub test to the new
  signature; the plan accounts for it.

## Open Questions

- Exact name-detection heuristic will be tuned against real fixtures during implementation;
  start simple (first plausible line) and refine with test cases.
