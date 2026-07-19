## 1. Design system

- [x] 1.1 `entrypoints/sidepanel/style.css` — tokens (light + dark via `prefers-color-scheme`), base/reset, buttons, inputs, cards, sections, pills, drop zone, save bar; import from `main.tsx`
- [x] 1.2 Rewrite `fields.tsx` to class-based `TextField`/`ListTextArea`; drop the inline `ui` object

## 2. Components

- [x] 2.1 `App.tsx` — branded header (inline SVG logo), content shell, sticky save bar (Save / Clear / sync warning / saved-at)
- [x] 2.2 `Upload.tsx` — drop zone (drag & drop + click) for the empty state; compact replace button otherwise; parsing state
- [x] 2.3 `Preview.tsx` — collapsible `<details>` sections, entry cards, add/remove buttons, validation styling
- [x] 2.4 `FillPage.tsx` — status pills, current→new diff rows, action buttons

## 3. Verification

- [x] 3.1 `pnpm compile` / `pnpm test` / `pnpm e2e` / `pnpm lint` / `pnpm build` green
- [ ] 3.2 Manual: visual pass in light + dark, drag-drop upload works — **needs user**
