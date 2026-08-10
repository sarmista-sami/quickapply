## 1. Rename

- [x] 1.1 `wxt.config.ts` — manifest `name` → `QuickApply`
- [x] 1.2 `entrypoints/sidepanel/App.tsx` — header `<h1>` → `QuickApply`
- [x] 1.3 `entrypoints/sidepanel/index.html` — `<title>` → `QuickApply`
- [x] 1.4 `entrypoints/sidepanel/style.css` — design-system header comment → `QuickApply`

## 2. Green accent

- [x] 2.1 Light-theme accent tokens (`--accent`/`--accent-hover`/`--accent-soft`/`--accent-ring`) → emerald `#059669` family
- [x] 2.2 Dark-theme accent tokens → emerald `#34d399` family

## 3. Logo / icon

- [x] 3.1 Resize the logo into `public/icon/{16,32,48,96,128}.png`; confirm WXT populates the manifest `icons`
- [x] 3.2 Replace the header lightning-SVG mark with the actual icon image (`icon/128.png`); drop the gradient container so header mark == extension icon

## 4. README

- [x] 4.1 Retitle to QuickApply; add hero flow illustration + "How it works" Mermaid diagram
- [x] 4.2 Add a side-panel screenshot (sample data, sensitive fields blurred)

## 5. Verification

- [x] 5.1 `pnpm compile` green
- [x] 5.2 `pnpm build` green; manifest `icons` present; branded icon renders sharp
- [x] 5.3 Re-rendered panel screenshot confirms QuickApply name, green accent, matching header logo
