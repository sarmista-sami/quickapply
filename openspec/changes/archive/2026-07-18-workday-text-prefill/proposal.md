## Why

Stages 1–3 get résumé data parsed, reviewed, and roaming across devices — but the user
still types it into job applications by hand. Stage 4 delivers the payoff: pre-fill a
Workday application from the stored `ApplicantData`. This first increment (4a) proves the
whole fill pipeline end-to-end on the safest field type — text inputs — before tackling
dropdowns, dates, and multi-step wizards in later increments.

## What Changes

- Add a declarative Workday **field map** (`ApplicantData` path → `data-automation-id` +
  type) for text fields: first/last name, email, phone, and address lines.
- Implement `WorkdayAdapter.plan(data)` and `.fill(plan)`:
  - `plan` reads the page for mapped fields present and returns `FieldFill[]` with label,
    selector, target value, and current value — **without mutating the page** (drives a
    preview).
  - `fill` writes each value via the **native property setter** + dispatched
    `input`/`change` events (reliable for React-controlled inputs), waits for
    async-loaded fields, and **never submits the form**.
- Wire the **content script** to handle `plan-request`/`fill-request` messages (existing
  `protocol.ts`) by delegating to `WorkdayAdapter`.
- Add a side-panel **"Fill this Workday page"** flow: Preview (list what will be filled,
  with current vs new value) → Fill (apply, show a `FillResult`). Messages the active tab.
- Add **Playwright** e2e that injects the adapter DOM logic into a served fixture
  replicating Workday markup (including a controlled-input trap) to prove the
  native-setter path in real Chromium; Vitest covers the pure field-map logic.
- Add the **`activeTab`** permission for tab messaging (still no broad `host_permissions`).

## Capabilities

### New Capabilities
- `workday-prefill`: Workday text-field pre-fill — declarative field map, plan/preview
  and fill via native-setter writes with async waits and no auto-submit, driven from the
  side panel through the content script.

### Modified Capabilities
- `core-layer-contracts`: the Workday adapter requirement changes from "stub throws
  NotImplemented" to implemented `plan`/`fill` behavior.
- `extension-skeleton`: the content entrypoint changes from "no page mutation" to
  handling fill messages and writing mapped fields.

## Impact

- New: `src/site-adapters/workday/field-map.ts`, `dom.ts`; implemented
  `src/site-adapters/workday/index.ts`. Content-script handler in `entrypoints/content.ts`.
  Side-panel "Fill page" component. Playwright config + fixture + e2e; new dev dep
  `@playwright/test`.
- Manifest: adds `activeTab`. Content script already scoped to Workday domains. Still no
  `host_permissions`.
- `src/core` untouched (DOM/native-setter code is edge, in the Workday adapter).
