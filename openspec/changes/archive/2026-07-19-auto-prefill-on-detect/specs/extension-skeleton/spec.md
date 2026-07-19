## MODIFIED Requirements

### Requirement: Three browser entrypoints exist
The system SHALL define `background`, `sidepanel`, and `content` entrypoints. The content
entrypoint, scoped to Workday domains, SHALL auto-fill detected empty mapped fields from the
stored `ApplicantData` (re-running as fields render) and SHALL handle
`plan-request`/`fill-request`/`upload-resume-request` messages. It MUST NOT submit the form.

#### Scenario: Entrypoints are built
- **WHEN** the extension is built
- **THEN** the manifest and output include background, side-panel, and content-script
  entrypoints

#### Scenario: Content entrypoint auto-fills and responds to messages
- **WHEN** the content script loads on a Workday page with stored data
- **THEN** it auto-fills detected empty fields without submitting
- **AND** it still replies to `plan-request`/`fill-request` messages from the panel
