## 0. Capture real Workday DOM (interactive)

- [x] 0.1 Install `@playwright/test` + Chromium; `e2e/capture/capture-dom.ts` — headed launch, persistent profile, open reference posting, wait for the `applyManually` form
- [x] 0.2 User signs in and reaches the manual form; dump every `[data-automation-id]` (id, tag, input type, label/aria) to `e2e/capture/workday-automation-ids.json`
- [x] 0.3 Review the dump; identify the real ids for name/email/phone/address text fields

## 1. Workday field map

- [x] 1.1 `src/site-adapters/workday/field-map.ts` — entries `{ path, automationId, type }` for firstName, lastName, email, phone, address line(s), built from the captured real ids; pure accessor from `ApplicantData`
- [x] 1.2 `src/site-adapters/workday/field-map.test.ts` (Vitest) — value resolution for present fields; empty source → no entry

## 2. DOM helpers (edge)

- [x] 2.1 `src/site-adapters/workday/dom.ts` — `findByAutomationId`, `readValue`, `setNativeValue` (native property setter + dispatch `input`/`change`), `waitForField(id, timeout)`
- [x] 2.2 Keep DOM code out of `src/core` (edge only)

## 3. WorkdayAdapter

- [x] 3.1 Implement `plan(data)` — resolve mapped values, read page per `data-automation-id`, emit `FieldFill{ label, selector, value, currentValue }` for present fields; no mutation
- [x] 3.2 Implement `fill(plan)` — `waitForField` then `setNativeValue` per entry; aggregate `FillResult{ filled, skipped, errors }`; never touch submit controls
- [x] 3.3 Replace `workday-adapter.test.ts` NotImplemented assertions with `matches` behavior (keep pure); DOM behavior covered by Playwright

## 4. Content script messaging

- [x] 4.1 `entrypoints/content.ts` — `chrome.runtime.onMessage` handler for `plan-request`/`fill-request`; load `ApplicantData` is passed in the message (panel supplies it); delegate to `WorkdayAdapter`; reply `plan-response`/`fill-response`
- [x] 4.2 Guard: only respond when `WorkdayAdapter.matches(location.href)`

## 5. Side-panel fill flow

- [x] 5.1 `entrypoints/sidepanel/page-fill.ts` — resolve active tab id (`chrome.tabs.query`), send `plan-request`/`fill-request` with current `ApplicantData`
- [x] 5.2 `entrypoints/sidepanel/components/FillPage.tsx` — Preview (list label/current→new), Fill button, `FillResult` summary, non-Workday notice
- [x] 5.3 Wire `FillPage` into `App.tsx` (shown when data exists)

## 6. Playwright e2e

- [x] 6.1 Add `@playwright/test`; `playwright.config.ts`; `pnpm e2e` script
- [x] 6.2 `e2e/fixtures/workday-form.html` — built from the captured markup (task 0); real `data-automation-id` text fields + a controlled-input trap (reverts raw `.value=`, commits on `input` event)
- [x] 6.3 `e2e/workday-fill.spec.ts` — inject built adapter DOM module; assert `plan` reads current values without mutation and `fill` sets controlled inputs via native setter; assert no submit fired
- [x] 6.4 `e2e/real-run.md` (or guarded spec) — instructions/script to point Playwright at the reference PwC posting for manual selector refinement

## 7. Manifest

- [x] 7.1 Add `activeTab` permission in `wxt.config.ts`; keep content script scoped to Workday; still no `host_permissions`

## 8. Verification

- [x] 8.1 `pnpm compile` clean
- [x] 8.2 `pnpm test` green (field-map + adapter matches + existing suites)
- [x] 8.3 `pnpm e2e` green (fixture fill via native setter, no submit)
- [x] 8.4 `pnpm build` — loadable `.output/`; manifest has `activeTab`, no `host_permissions`
- [ ] 8.5 Manual: on the reference PwC `applyManually` page, open panel → Preview shows mapped fields → Fill populates name/email/phone/address, no submit — **needs user**
- [x] 8.6 Confirm no `src/core/*` imports `chrome.*` / DOM globals
