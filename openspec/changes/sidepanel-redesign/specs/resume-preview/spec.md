## ADDED Requirements

### Requirement: Drag-and-drop upload
The side panel SHALL accept a résumé dropped onto the upload area, applying the same
format validation as the file picker.

#### Scenario: File dropped on the drop zone
- **WHEN** the user drags a `.docx` or `.pdf` onto the upload area and drops it
- **THEN** the file is parsed exactly as if chosen via the picker

#### Scenario: Unsupported file dropped
- **WHEN** the user drops an unsupported file type
- **THEN** the unsupported-format message is shown and nothing is parsed

### Requirement: Adaptive color scheme
The side panel SHALL follow the browser's preferred color scheme, rendering a legible
light and dark theme from the same markup.

#### Scenario: Dark scheme preferred
- **WHEN** the browser prefers a dark color scheme
- **THEN** the panel renders with dark surfaces and legible text without any user setting
