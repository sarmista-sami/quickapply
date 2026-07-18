# extension-skeleton Specification

## Purpose
A runnable WXT + React + TypeScript MV3 Chrome extension whose side panel opens on the toolbar action, with background/sidepanel/content entrypoints and standard build/dev/test tooling.
## Requirements
### Requirement: Runnable WXT extension project
The system SHALL provide a WXT + React + TypeScript MV3 extension project managed with
pnpm, buildable and testable via standard scripts.

#### Scenario: Production build succeeds
- **WHEN** a developer runs `pnpm build`
- **THEN** WXT produces a loadable MV3 extension in `.output/`
- **AND** the generated manifest declares MV3, the `sidePanel` and `storage` permissions,
  and no `host_permissions`

#### Scenario: Typecheck passes
- **WHEN** a developer runs `pnpm compile`
- **THEN** the TypeScript compiler reports no errors

#### Scenario: Test suite runs green
- **WHEN** a developer runs `pnpm test`
- **THEN** Vitest executes the placeholder suite and all tests pass

### Requirement: Side panel opens on action click
The system SHALL open the extension side panel when the user clicks the extension
toolbar action.

#### Scenario: User opens the panel
- **WHEN** the user clicks the extension action icon in the browser toolbar
- **THEN** the background entrypoint opens the Chrome side panel
- **AND** the React side-panel app shell renders

### Requirement: Three browser entrypoints exist
The system SHALL define `background`, `sidepanel`, and `content` entrypoints. The content
entrypoint, scoped to Workday domains, SHALL handle `plan-request`/`fill-request` messages
by delegating to the site adapter to preview and write form fields.

#### Scenario: Entrypoints are built
- **WHEN** the extension is built
- **THEN** the manifest and output include background, side-panel, and content-script
  entrypoints

#### Scenario: Content entrypoint responds to fill messages
- **WHEN** the content script receives a `plan-request` on a Workday page
- **THEN** it replies with the planned fills from the site adapter
- **AND** on a `fill-request` it applies the writes and replies with the result

