## Context

The pipeline is `File → text → parse → normalize`. docx uses mammoth (lazy). The core
parser already takes text, so PDF only needs a text extractor. pdf.js needs a worker;
in a side-panel extension page a bundled worker URL works. Constraint: extraction is edge;
`src/core` untouched.

## Goals / Non-Goals

**Goals:** extract text from a PDF résumé; route by format; keep pdf.js lazy and testable.

**Non-Goals:** layout/column reconstruction, OCR of scanned PDFs, encrypted PDFs.

## Decisions

**pdf.js in an edge module, worker configured by the pipeline.** `extract.ts` imports
`pdfjs-dist` and exposes `extractPdfText(buffer)`, `isPdf(file)`, and `configureWorker(url)`.
It does NOT import the worker itself, so the unit test can mock `pdfjs-dist` without the
`?url` worker import. The browser pipeline imports the bundled worker URL
(`pdfjs-dist/build/pdf.worker.min.mjs?url`) and calls `configureWorker` before extraction.

**Lazy load.** The pipeline dynamically imports the pdf extractor only when a PDF is
picked, keeping pdf.js out of the initial side-panel bundle (as with mammoth).

**Text assembly.** Concatenate each page's `getTextContent().items[].str` with spaces and
newlines between pages — good enough for the heuristic parser, which is line/section based.

## Risks / Trade-offs

- [Scanned/image PDFs yield no text] → Extraction returns empty; the user edits fields
  manually in the preview. Not an error.
- [Worker bundling in WXT] → Uses the standard `?url` import; if the worker fails to load,
  pdf extraction throws and the Upload surfaces the error (docx still works).
- [pdf.js bundle size] → Isolated to a lazy chunk fetched only on PDF upload.

## Open Questions

- Real-browser worker load can only be confirmed manually (build env can't run the
  extension); docx path is unaffected.
