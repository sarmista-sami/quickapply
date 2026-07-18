import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(join(here, 'fixtures/workday-form.html'), 'utf8');
const bundle = readFileSync(join(here, '.tmp/workday-adapter.js'), 'utf8');

const DATA = {
  contact: {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    phone: '+31 6 1234 5678',
    location: 'Sesame Street 1',
  },
  work: [],
  education: [],
  skills: [],
  links: [],
  extra: {},
};

const FIRST = '[data-automation-id="formField-legalName--firstName"] input';

test.beforeEach(async ({ page }) => {
  await page.setContent(fixture);
  await page.addScriptTag({ content: bundle });
});

test('plan reads current values without mutating the page', async ({ page }) => {
  const before = await page.inputValue(FIRST);
  const plan = await page.evaluate((d) => new (window as any).WorkdayAdapter().plan(d), DATA);

  const first = plan.find((f: any) => f.label === 'First name');
  expect(first.value).toBe('Ada');
  expect(first.currentValue).toBe('');
  // Phone + Address present, email omitted (not on this page).
  expect(plan.map((f: any) => f.label).sort()).toEqual(['Address', 'First name', 'Last name', 'Phone']);
  // No mutation.
  expect(await page.inputValue(FIRST)).toBe(before);
});

test('fill commits controlled inputs via the native setter and never submits', async ({ page }) => {
  const result = await page.evaluate(async (d) => {
    const adapter = new (window as any).WorkdayAdapter();
    return adapter.fill(adapter.plan(d));
  }, DATA);

  expect(result.filled).toBe(4);
  expect(result.skipped).toBe(0);

  // The controlled "committed" mirror updated → native setter + events worked.
  expect(await page.getAttribute(FIRST, 'data-committed')).toBe('Ada');
  expect(await page.inputValue(FIRST)).toBe('Ada');
  expect(await page.inputValue('[data-automation-id="formField-phoneNumber"] input')).toBe('31612345678');

  // The form was never submitted/advanced.
  expect(await page.evaluate(() => (window as any).__submitted)).toBe(false);
});

test('raw value assignment does NOT commit (proves the trap is real)', async ({ page }) => {
  await page.evaluate((sel) => {
    (document.querySelector(sel) as HTMLInputElement).value = 'Bypass';
  }, FIRST);
  // value shows, but committed mirror stays empty because no input event fired.
  expect(await page.inputValue(FIRST)).toBe('Bypass');
  expect(await page.getAttribute(FIRST, 'data-committed')).toBe('');
});
