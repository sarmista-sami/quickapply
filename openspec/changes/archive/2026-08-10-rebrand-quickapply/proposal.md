## Why

The extension shipped under the working name "Resume Autofill" with an indigo accent and
a bare lightning-bolt logo mark. The project is being published publicly as **QuickApply**
and needs one consistent brand: a single name, a single logo, and an accent colour that
reads as related to Workday (the first supported site). This change is retro-fitted — the
work was applied interactively during publishing, then documented here to keep OpenSpec the
source of truth.

## What Changes

- Rename every user-facing surface from "Resume Autofill" to **QuickApply**: manifest
  `name`, the side-panel `<h1>`, the document `<title>`, and the stylesheet header.
- Introduce a green accent palette (light + dark) in place of indigo, so the logo mark,
  primary button, focus rings, and links all read as one brand.
- Add a real logo: a green rounded-square icon (résumé + lightning bolt), wired as the
  extension icon (`public/icon/{16,32,48,96,128}.png`, auto-added to the manifest by WXT)
  and reused as the side-panel header mark so the two are identical.
- Purely cosmetic README refresh (title, hero flow illustration, "How it works" Mermaid
  diagram, side-panel screenshot) — no behavioural claims changed.

## Capabilities

### Modified Capabilities
- `resume-preview`: the side panel presents a consistent brand identity — the QuickApply
  name and the shared logo mark in the header. No data, validation, or flow changes.

## Impact

- Edited: `wxt.config.ts` (manifest name), `entrypoints/sidepanel/App.tsx` (title + logo
  component), `entrypoints/sidepanel/index.html` (title), `entrypoints/sidepanel/style.css`
  (accent tokens + header comment). Added: `public/icon/{16,32,48,96,128}.png` and README
  assets under `docs/`.
- No logic, storage, parser, normalizer, or adapter changes. No permission changes. No
  schema changes. Unit/e2e tests unaffected (logic untouched).
