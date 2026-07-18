// Autonomous multi-stage Workday capture. Creates a dummy candidate account, then walks
// the apply flow: at each stage it dumps the full DOM (workday-stage-<n>.json), auto-fills
// visible text inputs, and clicks Next. If Next is blocked by a required custom widget
// (dropdown/date), it writes NEEDHELP.txt and waits for GO.txt so you can fill that field
// and let it continue. It NEVER clicks a final Submit.
//
//   node e2e/capture/capture-drive.mjs "<applyManually-url>"
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync, writeFileSync, rmSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const PROFILE_DIR = resolve(here, '..', process.env.PW_PROFILE ?? '.pw-profile-drive');
const GO = resolve(here, 'GO.txt');
const NEEDHELP = resolve(here, 'NEEDHELP.txt');
const STOP = resolve(here, 'STOP.txt');

const url = process.argv[2] ?? 'https://pwc.wd3.myworkdayjobs.com/en-US/Global_Experienced_Careers';
const EMAIL = `resume.ext.${Date.now()}@example.com`;
const PASSWORD = 'Testpass123!';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const DUMP = () => {
  const rows = [];
  for (const el of Array.from(document.querySelectorAll('[data-automation-id]'))) {
    const rect = el.getBoundingClientRect();
    rows.push({
      automationId: el.getAttribute('data-automation-id'),
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute('type') || '',
      label: (el.getAttribute('aria-label') || el.closest('label')?.textContent?.trim() || '').slice(0, 80),
      visible: rect.width > 0 && rect.height > 0,
    });
  }
  const controls = [];
  for (const c of Array.from(document.querySelectorAll('input, select, textarea, button'))) {
    const wrap = c.closest('[data-automation-id]');
    controls.push({
      tag: c.tagName.toLowerCase(),
      type: c.getAttribute('type') || '',
      ownAid: c.getAttribute('data-automation-id') || '',
      name: c.getAttribute('name') || '',
      closestAid: wrap ? wrap.getAttribute('data-automation-id') : '',
    });
  }
  return { href: location.href, count: rows.length, rows, controls };
};

const AUTOFILL = () => {
  const setNative = (el, v) => {
    const d = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value');
    d?.set?.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };
  let n = 0;
  for (const el of Array.from(document.querySelectorAll('input[type=text], textarea'))) {
    if (el.name === 'website') continue; // honeypot
    if (el.value) continue;
    if (el.getBoundingClientRect().width === 0) continue;
    setNative(el, 'Test');
    n++;
  }
  return n;
};

const HAS_ERRORS = () =>
  Array.from(document.querySelectorAll('[data-automation-id="errorMessage"], [role="alert"]')).some(
    (e) => e.offsetParent !== null && (e.textContent || '').trim().length > 0,
  );

async function dumpStage(page, n) {
  const dumps = [];
  for (const frame of page.frames()) {
    try {
      const d = await frame.evaluate(DUMP);
      if (d.count > 0) dumps.push(d);
    } catch {}
  }
  dumps.sort((a, b) => b.count - a.count);
  const out = resolve(here, `workday-stage-${n}.json`);
  writeFileSync(out, JSON.stringify({ capturedAt: new Date().toISOString(), stage: n, dumps }, null, 2));
  console.log(`Captured stage ${n} → ${out} (${dumps.reduce((s, d) => s + d.count, 0)} els, ${dumps[0]?.href})`);
}

async function clickIfPresent(page, selector) {
  const el = page.locator(selector).first();
  if (await el.count().then((c) => c > 0).catch(() => false)) {
    await el.click({ timeout: 3000 }).catch(() => {});
    return true;
  }
  return false;
}

for (const f of [GO, NEEDHELP, STOP]) if (existsSync(f)) rmSync(f);

const context = await chromium.launchPersistentContext(PROFILE_DIR, {
  headless: false,
  viewport: { width: 1280, height: 950 },
});
const page = context.pages()[0] ?? (await context.newPage());
await page.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => {});
await wait(2000);

// Accept any legal-notice modal.
await clickIfPresent(page, '[data-automation-id="legalNoticeAcceptButton"]');
await wait(500);

// Create the dummy account. The create-account section may be collapsed behind an
// expander — open it first so the fields become visible/fillable.
console.log(`Creating account: ${EMAIL}`);
await clickIfPresent(page, '[data-automation-id="createAccountExpandButton"]');
await wait(1000);
for (const [sel, val] of [
  ['input[data-automation-id="email"]', EMAIL],
  ['input[data-automation-id="password"]', PASSWORD],
  ['input[data-automation-id="verifyPassword"]', PASSWORD],
]) {
  const el = page.locator(sel).first();
  if (await el.count().then((c) => c > 0).catch(() => false)) {
    await el.fill(val).catch(() => {});
  }
}
const cb = page.locator('input[data-automation-id="createAccountCheckbox"]').first();
if (await cb.count().then((c) => c > 0).catch(() => false)) await cb.check().catch(() => {});
await clickIfPresent(page, '[data-automation-id="createAccountSubmitButton"]');
await page.waitForLoadState('networkidle').catch(() => {});
await wait(3500);

// If account creation didn't advance to the apply flow, let the human finish it.
const stillOnAccount = await page
  .locator('[data-automation-id="createAccountSubmitButton"]')
  .first()
  .count()
  .then((c) => c > 0)
  .catch(() => false);
if (stillOnAccount) {
  console.log('Account step not advanced automatically. Complete sign-up/sign-in in the');
  console.log('window (reach My Information), then the agent creates GO.txt to continue.');
  writeFileSync(NEEDHELP, 'account');
  const deadline = Date.now() + 60 * 60 * 1000;
  while (!existsSync(GO) && !existsSync(STOP) && Date.now() < deadline) await wait(1500);
  if (existsSync(GO)) rmSync(GO);
  if (existsSync(NEEDHELP)) rmSync(NEEDHELP);
  await wait(1500);
}

// Walk the stages.
let n = 0;
const maxStages = 10;
while (n < maxStages) {
  if (existsSync(STOP)) break;
  n += 1;
  await dumpStage(page, n);

  // Stop before any final submit — capture Review but never submit.
  const submitPresent = await page
    .locator('[data-automation-id="pageFooterSubmitButton"], button:has-text("Submit")')
    .first()
    .count()
    .then((c) => c > 0)
    .catch(() => false);
  const nextPresent = await page
    .locator('[data-automation-id="pageFooterNextButton"]')
    .first()
    .count()
    .then((c) => c > 0)
    .catch(() => false);
  if (!nextPresent && submitPresent) {
    console.log('Reached a Submit step — captured, NOT submitting. Done.');
    break;
  }
  if (!nextPresent) {
    console.log('No Next button found — stopping.');
    break;
  }

  for (const frame of page.frames()) {
    try {
      await frame.evaluate(AUTOFILL);
    } catch {}
  }
  await wait(500);
  await clickIfPresent(page, '[data-automation-id="pageFooterNextButton"]');
  await page.waitForLoadState('networkidle').catch(() => {});
  await wait(2500);

  // Blocked by required custom widgets? Pause for human, then continue.
  const blocked = await page.evaluate(HAS_ERRORS).catch(() => false);
  if (blocked) {
    console.log(`Stage ${n}: Next blocked by required fields. Fill them in the window,`);
    console.log('then the agent creates GO.txt to continue.');
    writeFileSync(NEEDHELP, String(n));
    const deadline = Date.now() + 60 * 60 * 1000;
    while (!existsSync(GO) && !existsSync(STOP) && Date.now() < deadline) await wait(1500);
    if (existsSync(GO)) rmSync(GO);
    if (existsSync(NEEDHELP)) rmSync(NEEDHELP);
    await clickIfPresent(page, '[data-automation-id="pageFooterNextButton"]');
    await page.waitForLoadState('networkidle').catch(() => {});
    await wait(2500);
  }
}

console.log(`Finished after ${n} stage(s). Browser stays open 5s.`);
await wait(5000);
await context.close();
process.exit(0);
