// Multi-stage Workday DOM capture. Opens a headed, persistent-profile Chromium and then
// captures one stage per `GO` sentinel: on each GO it (optionally) auto-fills visible
// text inputs with dummy values via the native setter to help you advance, then dumps
// every [data-automation-id] element + form control across frames to
// workday-stage-<n>.json. Create STOP.txt (or close) to finish. NEVER submits.
//
//   node e2e/capture/capture-stages.mjs "<apply-url>"     (agent backgrounds this)
//   AUTOFILL=1 node ...                                   (also fill text fields)
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync, writeFileSync, rmSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const PROFILE_DIR = resolve(here, '..', process.env.PW_PROFILE ?? '.pw-profile-stages');
const GO = resolve(here, 'GO.txt');
const STAGEDONE = resolve(here, 'STAGEDONE.txt');
const STOP = resolve(here, 'STOP.txt');
const AUTOFILL = process.env.AUTOFILL === '1';

const url = process.argv[2] ?? 'https://pwc.wd3.myworkdayjobs.com/en-US/Global_Experienced_Careers';
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

// Fill visible text inputs (skip password/honeypot) with a dummy value via native setter.
const AUTOFILL_FN = () => {
  const setNative = (el, v) => {
    const d = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value');
    d?.set?.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };
  let n = 0;
  for (const el of Array.from(document.querySelectorAll('input[type=text], textarea'))) {
    if (el.name === 'website') continue; // beecatcher honeypot
    if (el.value) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0) continue;
    setNative(el, 'Test');
    n++;
  }
  return n;
};

for (const f of [GO, STAGEDONE, STOP]) if (existsSync(f)) rmSync(f);

const context = await chromium.launchPersistentContext(PROFILE_DIR, {
  headless: false,
  viewport: { width: 1280, height: 950 },
});
const page = context.pages()[0] ?? (await context.newPage());
await page.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => {});

console.log('\n=== MULTI-STAGE CAPTURE READY ===');
console.log('Advance to a stage, then the agent creates GO.txt to capture it.');
console.log(`AUTOFILL=${AUTOFILL ? 'on' : 'off'}. Create STOP.txt (or close) to finish. Never submits.`);

let n = 0;
const deadline = Date.now() + 60 * 60 * 1000;
while (Date.now() < deadline) {
  if (existsSync(STOP)) break;
  if (!existsSync(GO)) {
    await wait(1500);
    continue;
  }
  n += 1;
  if (AUTOFILL) {
    for (const frame of page.frames()) {
      try {
        const filled = await frame.evaluate(AUTOFILL_FN);
        if (filled) console.log(`  autofilled ${filled} text field(s)`);
      } catch {}
    }
  }
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
  console.log(`Captured stage ${n} → ${out} (${dumps.reduce((s, d) => s + d.count, 0)} els)`);
  rmSync(GO);
  writeFileSync(STAGEDONE, String(n));
}

await context.close();
process.exit(0);
