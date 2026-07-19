import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(join(here, 'fixtures/workday-form.html'), 'utf8');
const widgetsFixture = readFileSync(join(here, 'fixtures/workday-widgets.html'), 'utf8');
const bundle = readFileSync(join(here, '.tmp/workday-adapter.js'), 'utf8');

const DATA = {
  contact: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', phone: '+31 6 1234 5678', location: 'Sesame St 1' },
  work: [{ company: 'Analytical Engines', title: 'Mathematician', startDate: '1842', current: true, bullets: ['Wrote the first algorithm'] }],
  education: [],
  skills: [],
  links: [{ label: 'linkedin', url: 'https://linkedin.com/in/ada' }],
  extra: {},
};

const FIRST = '[data-automation-id="formField-legalName--firstName"] input';
const LAST = '[data-automation-id="formField-legalName--lastName"] input';

test('auto-fills empty fields but never overwrites existing input; no submit', async ({ page }) => {
  await page.setContent(fixture);
  await page.addScriptTag({ content: bundle });

  // Simulate user having already typed a first name.
  await page.evaluate((sel) => {
    const el = document.querySelector(sel) as HTMLInputElement;
    el.value = 'Grace';
    el.dataset.committed = 'Grace';
  }, FIRST);

  const result = await page.evaluate(async (d) => {
    const adapter = new (window as any).WorkdayAdapter();
    return (window as any).autofillEmpty(adapter, d);
  }, DATA);

  // Existing value preserved, empty fields filled.
  expect(await page.inputValue(FIRST)).toBe('Grace');
  expect(await page.inputValue(LAST)).toBe('Lovelace');
  expect(await page.getAttribute(LAST, 'data-committed')).toBe('Lovelace');
  expect(result.filled).toBeGreaterThanOrEqual(1);

  // Running again is a no-op (idempotent) and still no submit.
  const second = await page.evaluate(async (d) => {
    const adapter = new (window as any).WorkdayAdapter();
    return (window as any).autofillEmpty(adapter, d);
  }, DATA);
  expect(second.filled).toBe(0);
  expect(await page.evaluate(() => (window as any).__submitted)).toBe(false);
});

const WIDGET_DATA = {
  contact: {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    address: { city: 'Amsterdam', country: 'Netherlands' },
  },
  work: [{ company: 'Analytical Engines', title: 'Mathematician', startDate: '1842-06', current: true, bullets: [] }],
  education: [{ school: 'University of London', degree: 'Bachelor of Science' }],
  skills: ['Algorithms'],
  links: [],
  extra: {},
};

test('filled dropdown/multiselect/date are NOT re-filled on a second pass (loop guard)', async ({ page }) => {
  await page.setContent(widgetsFixture);
  await page.addScriptTag({ content: bundle });

  const first = await page.evaluate(async (d) => {
    const adapter = new (window as any).WorkdayAdapter();
    return (window as any).autofillEmpty(adapter, d);
  }, WIDGET_DATA);
  expect(first.filled).toBeGreaterThanOrEqual(4); // degree, country, city, skills, date

  // Everything now reports a current value → second pass touches nothing.
  const second = await page.evaluate(async (d) => {
    const adapter = new (window as any).WorkdayAdapter();
    return (window as any).autofillEmpty(adapter, d);
  }, WIDGET_DATA);
  expect(second.filled).toBe(0);
  expect(second.skipped).toBe(0);

  // Dropdown listbox was not reopened by the second pass.
  const portalOptions = await page.locator('#wd-portal [data-automation-id="promptOption"]').count();
  expect(portalOptions).toBe(0);
  expect(await page.evaluate(() => (window as any).__submitted)).toBe(false);
});

test('unmatchable dropdown value is attempted once per step (attempted set)', async ({ page }) => {
  await page.setContent(widgetsFixture);
  await page.addScriptTag({ content: bundle });

  const results = await page.evaluate(async (d) => {
    const adapter = new (window as any).WorkdayAdapter();
    const data = { ...d, education: [{ school: 'X', degree: 'Nonexistent Degree' }], skills: [], contact: { ...d.contact, address: undefined }, work: [] };
    const attempted = new Set<string>();
    const first = await (window as any).autofillEmpty(adapter, data, attempted);
    const second = await (window as any).autofillEmpty(adapter, data, attempted);
    return { first, second };
  }, WIDGET_DATA);

  expect(results.first.skipped).toBeGreaterThanOrEqual(1); // tried and failed once
  expect(results.second.filled).toBe(0);
  expect(results.second.skipped).toBe(0); // filtered by the attempted set — no retry
});
