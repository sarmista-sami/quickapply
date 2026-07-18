# Real Workday validation (manual)

The committed e2e (`pnpm e2e`) runs against a local fixture built from captured Workday
markup — deterministic, no network, no real accounts. Use this doc for occasional
validation against an actual posting.

## Capture DOM from a real posting

```bash
node e2e/capture/capture-dom.mjs "<workday-apply-url>"
```

Opens a headed Chromium with a persistent profile (`e2e/.pw-profile`). Sign in / create a
candidate account, reach the step you want, then create the sentinel so the dump runs:

```bash
echo go > e2e/capture/GO.txt
```

Output: `e2e/capture/workday-automation-ids.json` (element structure + form controls per
`data-automation-id` — no typed values). Use it to extend `src/site-adapters/workday/field-map.ts`.

Reference postings used so far:
- PwC (tenant wd3): `https://pwc.wd3.myworkdayjobs.com/en-US/Global_Experienced_Careers/.../apply/applyManually`
- Palo Alto Networks (tenant wd5): `https://paloaltonetworks.wd5.myworkdayjobs.com/en-US/panwexternalcareers/job/...`

## Validate the extension end-to-end

1. `pnpm build`, load `.output/chrome-mv3` unpacked.
2. Open a Workday application's **My Information** step.
3. Open the side panel → **Preview fill** → review → **Fill**.
4. Confirm first/last name, phone, and address line 1 populate and the form is NOT submitted.

Notes:
- Workday's apply flow has ~6 steps; 4a fills only My Information text fields. Work /
  education (My Experience step) and dropdowns/dates come in later increments.
- Avoid mass-creating throwaway candidate accounts on real tenants.
