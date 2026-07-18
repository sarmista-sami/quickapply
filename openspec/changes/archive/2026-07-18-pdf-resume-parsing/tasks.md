## 1. PDF extractor (edge)

- [x] 1.1 `src/parsers/pdf/extract.ts` — `extractPdfText(buffer)`, `isPdf(file)`, `configureWorker(url)` using `pdfjs-dist`
- [x] 1.2 Unit test with mocked `pdfjs-dist`: concatenates page text; `isPdf` accepts `.pdf`/pdf mime, rejects others

## 2. Pipeline routing

- [x] 2.1 `pipeline.ts` — detect docx vs pdf; lazy-import the right extractor; configure the pdf.js worker (bundled `?url`) before pdf extraction; widen `ParseMeta.format` to `'docx' | 'pdf'`
- [x] 2.2 `Upload` accepts `.pdf` (and pdf mime) in the picker + label

## 3. Verification

- [x] 3.1 `pnpm compile` clean
- [x] 3.2 `pnpm test` green (pdf extractor + existing)
- [x] 3.3 `pnpm build` — loadable; pdf.js in a lazy chunk; no permission changes
- [x] 3.4 No `src/core/*` chrome/DOM imports
- [ ] 3.5 Manual: upload a real PDF résumé; fields populate in preview — **needs user**
