## ADDED Requirements

### Requirement: Extract work and education dates
The normalizer SHALL parse start and end dates from work and education entry text in
common résumé formats, output them as `YYYY` or `YYYY-MM`, and set the current-role flag
when the end is expressed as "Present"/"Current".

#### Scenario: Year range parsed
- **WHEN** a work entry contains "2018 – 2020"
- **THEN** the work item's `startDate` is `2018` and `endDate` is `2020`

#### Scenario: Month-year with present
- **WHEN** a work entry contains "Jan 2019 - Present"
- **THEN** `startDate` is `2019-01`, `current` is true, and `endDate` is unset

#### Scenario: No date leaves fields empty
- **WHEN** a work entry has no recognizable date
- **THEN** `startDate` is empty and `current` is false, with no invented date
