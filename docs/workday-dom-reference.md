# Workday application DOM reference

Captured from real Workday postings (PwC tenant `wd3`, cross-checked against Palo Alto
Networks `wd5`) using the interactive tools in `e2e/capture/`. Automation-ids are
Workday-standard and **tenant-agnostic** unless noted. Use this to build/extend
`src/site-adapters/workday/field-map.ts` and to plan later increments.

Raw dumps (element structure only — no typed values): `e2e/capture/workday-*.json`.
Re-capture any stage with `e2e/capture/capture-stages.mjs` (see `e2e/real-run.md`).

## Conventions

- Every field is a `div[data-automation-id="formField-<X>"]` **wrapper** containing the
  real control. Target the descendant: `[data-automation-id="formField-<X>"] input`
  (or `textarea`). Text inputs also carry a stable `name` attribute.
- **Text input** → native-setter write + `input`/`change` events (see `dom.ts`). This is
  the implemented 4a path.
- **Custom dropdown** → a `button[data-automation-id="<name>"]` inside the wrapper (plus a
  hidden search `input`). Opening it renders a listbox of `p[data-automation-id="promptOption"]`
  items; selection uses `[data-automation-id="menuItem"]` / `selectedItem`. (Increment 4b.)
- **Multiselect** (skills, source) → `multiSelectContainer` / `multiselectInputContainer`,
  chips in `selectedItemList` > `selectedItem`, options as `promptOption`. (4b.)
- **Date picker** → `dateSectionMonth-input` / `dateSectionYear-input` (+ `-display`).
  Spinbutton-style; type digits per section. (Increment 4c.)
- **File upload** → `button[data-automation-id="select-files"]` + `input[type=file]`
  under `file-upload-input-ref` (résumé upload). (Later.)
- **Next / navigation**: `button[data-automation-id="pageFooterNextButton"]`; final step is
  a Submit — the adapter must **never** click it.
- **Never touch**: `input[name="website"]` (`beecatcher` honeypot), `password` /
  `verifyPassword`, and all Voluntary Disclosures / Self-Identify (EEO) fields.

## Flow (6 steps)

`My Information → My Experience → Application Questions → Voluntary Disclosures →
Self-Identify → Review`. A progress bar exposes `progressBarActiveStep` /
`progressBarInactiveStep`. Applications are multi-step, so filling all data means
advancing steps (never auto-submitting Review). (Increment 4d.)

## Account / sign-in page

Behind candidate sign-in. Create-account section may be collapsed behind
`createAccountExpandButton`.

| Field | Selector | Type | Maps to |
|---|---|---|---|
| Email | `[data-automation-id="formField-email"] input` (own aid `email`) | text | `contact.email` |
| Password / Verify | `input[data-automation-id="password"|"verifyPassword"]` | password | **never** |
| Consent | `input[data-automation-id="createAccountCheckbox"]` | checkbox | n/a |
| Submit | `[data-automation-id="createAccountSubmitButton"]` | submit | n/a |
| Legal modal | `[data-automation-id="legalNoticeAcceptButton"]` | button | n/a |

## Step 1 — My Information

| Field | Wrapper (`formField-…`) | inner control | Maps to | Increment |
|---|---|---|---|---|
| First name | `legalName--firstName` | input text (`name=legalName--firstName`) | `contact.firstName` | 4a ✓ |
| Middle name | `legalName--middleName` | input text | — | 4a-ext |
| Last name | `legalName--lastName` | input text | `contact.lastName` | 4a ✓ |
| Address line 1 | `addressLine1` | input text | `contact.location` (temp) | 4a ✓ |
| Address 3/4, City, Postal | `addressLine3`/`addressLine4`/`city`/`postalCode` | input text | structured address (model gap) | later |
| Phone number | `phoneNumber` | input text | `contact.phone` (digits only) | 4a ✓ |
| Extension | `extension` | input text | — | — |
| Country | `country` | **button dropdown** | (address country) | 4b |
| Phone type / code | `phoneType` / `countryPhoneCode` | **button dropdown / multiselect** | phone country code | 4b |
| Prev. worker | `candidateIsPreviousWorker` | radio | — | — |
| How did you hear (source) | `source` | multiselect | — | — |
| SMS opt-in | `phone-sms-opt-in` | checkbox | **never** (default off) | — |

> Model gap: `ApplicantData.contact.location` is a single string; Workday wants structured
> `addressLine1/city/postalCode/country`. Consider extending the model with a structured
> address before the address increment.

## Step 2 — My Experience (richest step)

**Work experience** (repeatable via `add-button`):

| Field | Wrapper | control | Maps to | Increment |
|---|---|---|---|---|
| Job title | `formField-jobTitle` | input text | `work[].title` | 4a-path |
| Company | `formField-companyName` | input text | `work[].company` | 4a-path |
| Location | `formField-location` | input text | — | — |
| Currently work here | `formField-currentlyWorkHere` | checkbox | `work[].current` | 4b |
| From/To dates | `dateSectionMonth-input` / `dateSectionYear-input` | date spinners | `work[].startDate/endDate` | 4c |
| Role description | `formField-roleDescription` | textarea | `work[].bullets` (joined) | 4a-path |

**Education**: `formField-degree` (dropdown, 4b), `formField-gradeAverage` (text),
plus school/field inputs. Maps to `education[]`.

**Skills**: `formField-skills` multiselect → `skills[]` (4b). **Languages**:
`formField-language` (dropdown) + `native` checkbox.

**Websites / links**: `formField-url` (input, `name=url`) → `links[]`;
`formField-linkedInAccount` → the LinkedIn link specifically.

**Résumé upload**: `select-files` button + `input[type=file]` under `file-upload-input-ref`.

> Some wrappers use hashed ids (e.g. `formField-e57e…`) for tenant-custom questions —
> not stable across tenants; match those by nearby label, not id.

## Steps 3–5 — Application Questions / Voluntary Disclosures / Self-Identify

- **Application Questions**: tenant-specific; wrappers are hashed ids
  (`formField-<hash>`) — **not** portable across tenants. Free-text `textarea` and custom
  dropdowns. Not auto-filled generically.
- **Voluntary Disclosures / Self-Identify**: gender, ethnicity, veteran, disability —
  **sensitive EEO; the extension must never auto-fill these.**

## Increment roadmap implied by this DOM

- **4a (done):** text fields — account email, My Info name/phone/address-line-1, and the
  same native-setter path covers My Experience text (jobTitle/company/roleDescription/url).
- **4b:** custom dropdowns + multiselect (country, degree, skills, currentlyWorkHere).
- **4c:** date pickers (work/education dates).
- **4d:** multi-step navigation (advance steps, repeatable work/education via `add-button`),
  résumé file upload. Never submit Review.
