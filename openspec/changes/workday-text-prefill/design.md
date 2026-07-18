## Context

The `SiteAdapter` interface (matches/plan/fill, plan≠fill, no auto-submit) and a
`WorkdayAdapter` stub exist from Stage 1; `protocol.ts` defines the sidepanel↔content
messages. Workday is a custom React app keyed on `data-automation-id` attributes.
Constraint (`AGENTS.md`): DOM/`chrome.*` code lives at the edge — the Workday adapter and
content script — not in `src/core`. Never auto-submit; always let the user review first.

## Goals / Non-Goals

**Goals:**
- Pre-fill Workday text inputs (name, email, phone, address) from `ApplicantData`.
- Reliable writes on React-controlled inputs via the native property setter + events.
- Preview-before-fill; wait for async fields; never submit.
- Real-browser confidence via Playwright against a Workday-like fixture.

**Non-Goals (later increments):** dropdowns/selects (4b), date pickers/autocomplete (4c),
multi-step wizards, iframes, shadow DOM (4d); driving a live Workday URL in CI; filling a
real posting automatically (manual validation).

## Decisions

**Declarative per-site field map.** `field-map.ts` lists entries of
`{ path, automationId, type }` mapping an `ApplicantData` accessor to Workday's
`data-automation-id`. Adding fields later is data, not code. Alternative (label/placeholder
heuristics) is unreliable on Workday's custom markup — rejected.

**plan reads, fill writes; both in the content script.** `plan(data)` queries the live
DOM for each mapped id, and for present fields emits `FieldFill{ label, selector, value,
currentValue }` with no mutation, so the panel can show a diff-style preview. `fill(plan)`
performs writes. Keeping `plan` DOM-aware (not pure) is necessary because only the page
knows which fields exist; purity is preserved where it matters (`src/core` stays clean).

**Native property setter.** Setting `input.value` directly leaves React's internal value
tracker stale, so the app ignores the change. `setNativeValue` uses
`Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set` then dispatches
`input` and `change` (bubbling) events. This is the crux the Playwright fixture verifies.

**Async waits.** Workday renders fields lazily. `fill` polls `findByAutomationId` per field
up to a timeout before writing; missing fields are reported in `FillResult`, not thrown.

**Messaging via active tab.** The side panel resolves the active tab
(`chrome.tabs.query({ active, currentWindow })`, id only — no host permission needed) and
`chrome.tabs.sendMessage`s `plan-request`/`fill-request`. The content script (already
scoped to Workday domains) replies with `plan-response`/`fill-response`. `activeTab` is
added for a clean, user-invoked permission grant.

**Field map derived from real captured DOM.** Rather than guessing Workday's ids, a headed
Playwright session with a persistent profile opens the reference posting; the user signs in
and reaches the `applyManually` form; a dump script extracts every `[data-automation-id]`
(id, tag, input type, nearby label/aria) to a captured artifact. The field map is built
from those real ids. The e2e fixture is authored from the captured markup so tests mirror
the real page.

**Playwright tests the DOM contract, not the whole extension.** Driving the extension's
side panel via Playwright is impractical; instead the e2e serves the captured-markup
fixture (with a controlled-input trap — an input that reverts raw `.value=` and only
commits on proper events), injects the built adapter DOM module, and asserts `plan`/`fill`
produce correct reads/writes in real Chromium. Vitest covers pure field-map logic. Full
extension messaging on a live posting is manual.

## Risks / Trade-offs

- [Real Workday automation-ids differ from assumptions] → The map is small and centralized;
  correcting an id is a one-line change. Manual validation on a real posting is a task.
- [No-auto-submit must hold] → The adapter has no submit path at all; enforced by design +
  review. A test asserts `fill` touches no button/submit.
- [Playwright adds toolchain weight] → Isolated to an `e2e/` dir + its own script; unit
  suite (Vitest) stays the fast default.
- [Partial fills confuse users] → `FillResult` reports filled/skipped/errors and the
  preview shows exactly what will change before the user commits.

## Reference posting

Development/validation target (PwC tenant, `wd3`):
`https://pwc.wd3.myworkdayjobs.com/en-US/Global_Experienced_Careers/job/Amsterdam/XMLNAME--Senior--Associate-Operational-Tax-Reporting_736247WD/apply/applyManually`
The `applyManually` page holds the manual-entry form. Second target (Palo Alto Networks,
tenant `wd5`):
`https://paloaltonetworks.wd5.myworkdayjobs.com/en-US/panwexternalcareers/job/Amsterdam-Netherlands/Senior-Customer-Success-Engineer-Cortex-EMEA_JR-019603`.
Two tenants (`wd3`, `wd5`) confirm the map must key on Workday's **standard, tenant-agnostic**
`data-automation-id`s, not tenant-specific markup. Both are already matched by the adapter
regex. These pages sit behind Workday candidate sign-in, so their authenticated DOM can't
be scraped from the build environment — the field map starts from Workday's standard
`data-automation-id`s and is refined against these URLs during manual validation and an
optional Playwright real-run script.

## Open Questions

- Exact Workday address `data-automation-id`s vary by tenant/localization; start with the
  common layout ids and refine against the reference posting above.
