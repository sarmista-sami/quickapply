// Interactive Workday DOM capture.
// Launches a headed, persistent-profile Chromium at the reference posting, waits for a
// `GO` sentinel file (created once you've signed in and reached the manual form), then
// dumps every [data-automation-id] element's structure (NOT its typed value) to JSON.
//
// Run (backgrounded by the agent):
//   node e2e/capture/capture-dom.mjs "<url>"
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync, writeFileSync, rmSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
// PW_PROFILE lets us use a fresh, signed-out profile (e.g. to capture the sign-in page).
const PROFILE_DIR = resolve(here, '..', process.env.PW_PROFILE ?? '.pw-profile');
const GO_FILE = resolve(here, 'GO.txt');
const DONE_FILE = resolve(here, 'DONE.txt');
const OUT_FILE = resolve(here, 'workday-automation-ids.json');

const url =
  process.argv[2] ??
  'https://pwc.wd3.myworkdayjobs.com/en-US/Global_Experienced_Careers';

const DUMP_IN_PAGE = () => {
  const rows = [];
  for (const el of Array.from(document.querySelectorAll('[data-automation-id]'))) {
    const label =
      el.getAttribute('aria-label') ||
      (el.id && document.querySelector(`label[for="${el.id}"]`)?.textContent?.trim()) ||
      el.closest('label')?.textContent?.trim() ||
      '';
    const rect = el.getBoundingClientRect();
    rows.push({
      automationId: el.getAttribute('data-automation-id'),
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute('type') || '',
      inputName: el.getAttribute('name') || '',
      id: el.id || '',
      placeholder: el.getAttribute('placeholder') || '',
      label: (label || '').slice(0, 80),
      visible: rect.width > 0 && rect.height > 0,
    });
  }
  // Every form control + its closest data-automation-id ancestor, so we learn what the
  // real inner <input>/<select> inside each formField-* wrapper looks like.
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

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

for (const f of [GO_FILE, DONE_FILE]) if (existsSync(f)) rmSync(f);

const context = await chromium.launchPersistentContext(PROFILE_DIR, {
  headless: false,
  viewport: { width: 1280, height: 900 },
});
const page = context.pages()[0] ?? (await context.newPage());
await page.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => {});

console.log('\n=== CAPTURE READY ===');
console.log('Sign in and navigate to the manual application form in the opened window.');
console.log(`When the form is visible, the agent will create: ${GO_FILE}`);

// Wait up to 40 minutes for the GO sentinel.
const deadline = Date.now() + 40 * 60 * 1000;
while (!existsSync(GO_FILE)) {
  if (Date.now() > deadline) {
    console.log('Timed out waiting for GO. Closing.');
    await context.close();
    process.exit(1);
  }
  await wait(2000);
}

// Dump across the main frame and every child frame (Workday sometimes iframes the app).
const frames = page.frames();
const dumps = [];
for (const frame of frames) {
  try {
    const d = await frame.evaluate(DUMP_IN_PAGE);
    if (d.count > 0) dumps.push(d);
  } catch {
    /* cross-origin or detached frame — skip */
  }
}
dumps.sort((a, b) => b.count - a.count);
writeFileSync(OUT_FILE, JSON.stringify({ capturedAt: new Date().toISOString(), url, dumps }, null, 2));
writeFileSync(DONE_FILE, 'ok');
console.log(`Wrote ${OUT_FILE} (${dumps.reduce((n, d) => n + d.count, 0)} elements).`);

// Keep the window open briefly so you can keep working if needed, then close.
await wait(3000);
await context.close();
process.exit(0);
