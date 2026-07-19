import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(join(here, 'fixtures/workday-form.html'), 'utf8');
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
