## Why

The side panel is functional but visually bare — unstyled inline CSS, no hierarchy, no
dark mode, a plain file-input button. A polished UI builds trust for a tool that handles
someone's job applications.

## What Changes

- Introduce a real design system: a stylesheet with CSS custom properties (color tokens,
  radius, shadows, focus rings), automatic **light/dark theme** via
  `prefers-color-scheme`, and consistent button/input/card primitives.
- App shell: branded header (logo mark + name), sectioned content, sticky save bar.
- Upload becomes a proper **drop zone** (drag & drop + click to browse) with clear
  supported-format hints and parsing state.
- Preview groups become **collapsible sections** (native `<details>`) with entry cards,
  add/remove affordances, and inline validation styling.
- Workday panel: status pills, a readable current→new diff list, clearer actions.
- All inline `ui` style objects replaced by classes; components keep their APIs.

## Capabilities

### Modified Capabilities
- `resume-preview`: upload supports drag & drop, and the panel adapts to the browser's
  light/dark color scheme. (Other changes are purely visual.)

## Impact

- New `entrypoints/sidepanel/style.css`; rewrites of `App.tsx`, `Upload.tsx`,
  `Preview.tsx`, `FillPage.tsx`, `fields.tsx`. No logic, storage, or adapter changes; no
  permission changes. Tests unaffected (logic untouched).
