## MODIFIED Requirements

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
