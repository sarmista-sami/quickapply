## ADDED Requirements

### Requirement: Retain the original résumé file locally
The system SHALL store the uploaded résumé file (name, MIME type, bytes) in
`chrome.storage.local` after a successful parse, and SHALL NOT place it in synced storage.

#### Scenario: File stored after parse
- **WHEN** a résumé is parsed successfully
- **THEN** its file (name, type, bytes) is saved in local storage

#### Scenario: Round-trip
- **WHEN** the stored résumé file is loaded
- **THEN** it reconstructs to a file with the original name, type, and bytes

### Requirement: Attach the stored résumé to a Workday file input
The system SHALL set the stored résumé into a Workday file input using a `DataTransfer`
assignment and dispatch a change event, without submitting the form.

#### Scenario: File input populated
- **WHEN** the user attaches the résumé on a Workday page with a file input
- **THEN** the input's selected file has the stored file's name and a change event fired

#### Scenario: No file input present
- **WHEN** the active page has no résumé file input
- **THEN** the attach action reports failure and nothing is submitted

#### Scenario: No stored file
- **WHEN** the user attaches but no résumé file has been stored
- **THEN** the action reports that there is nothing to attach
