## Why

Résumés are commonly PDFs, but the extension only accepts `.docx`. Adding PDF text
extraction lets users upload the format they most often have, feeding the same
parse/normalize/preview pipeline.

## What Changes

- Add an edge PDF text extractor (`src/parsers/pdf/`) using `pdfjs-dist`
  (`getDocument` → per-page `getTextContent`), lazy-loaded like the docx extractor so it
  stays out of the side panel's initial bundle.
- Accept `.pdf` in the upload picker; the pipeline detects format and routes docx→mammoth,
  pdf→pdfjs, then runs the existing core `parse`/`normalize`.
- `ParseMeta.format` widens to `'docx' | 'pdf'`; the core parser is unchanged (text in).
- Configure the pdf.js worker in the browser pipeline (bundled worker URL).

## Capabilities

### New Capabilities
<!-- none — extends existing resume-parsing -->

### Modified Capabilities
- `resume-parsing`: text extraction now supports PDF in addition to docx.

## Impact

- New `src/parsers/pdf/extract.ts` (+ test with mocked pdfjs). New dep `pdfjs-dist`.
  `pipeline.ts` routes by format and configures the worker. `Upload` accepts `.pdf`.
- Larger lazy chunk for pdf.js (loaded only when a PDF is picked). No manifest/permission
  changes. `src/core` untouched.
