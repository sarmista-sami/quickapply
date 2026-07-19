## Context

All side-panel styling is inline `ui` style objects — no theme, no dark mode, no visual
hierarchy. The panel is ~400 px wide inside Chrome's side panel; content must be compact,
scannable, and legible in both color schemes.

## Goals / Non-Goals

**Goals:** professional, compact visual design; light/dark theming; drag-drop upload;
collapsible groups; zero behavior/logic changes elsewhere.
**Non-Goals:** component library dependency (keep zero new deps); animations beyond
subtle transitions; icon fonts (inline SVG only).

## Decisions

**Plain CSS with custom properties, no library.** A single `style.css` defines tokens
(`--bg`, `--surface`, `--border`, `--text`, `--muted`, `--accent`, `--danger`, …) with a
`prefers-color-scheme: dark` override block. Avoids adding Tailwind/CSS-in-JS deps to an
extension bundle and keeps the design auditable in one file.

**Indigo accent, neutral surfaces.** Accent `#4f46e5` (indigo) with hover/active shades;
neutral gray surfaces; success/warn/danger tokens for status text. Focus rings use the
accent at 35% alpha for accessibility.

**Native `<details>` for collapsible sections.** Zero-JS collapse/expand with a styled
`<summary>` (chevron rotates via CSS). Contact/Address stay open by default; long lists
(Work, Education, Skills, Links) are collapsible.

**Drop zone upload.** The empty state renders a dashed drop zone (drag-over highlight via
a `dragging` class, drop handled with `DataTransfer.files`); the same component renders
as a compact button when data already exists ("Replace…"). Format guard unchanged.

**Sticky save bar.** Save/Clear live in a bottom bar (`position: sticky`) so they're
always reachable while editing long forms; sync warnings render inside it.

## Risks / Trade-offs

- [Class rewrite touches every component] → Logic untouched; suites + build verify.
- [Dark-mode contrast] → Tokens chosen against WCAG-ish contrast on both schemes; text
  never below ~4.5:1 on its surface.

## Open Questions

- None.
