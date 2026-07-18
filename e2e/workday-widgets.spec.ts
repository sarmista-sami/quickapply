import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(join(here, 'fixtures/workday-widgets.html'), 'utf8');
const bundle = readFileSync(join(here, '.tmp/workday-adapter.js'), 'utf8');

const DATA = {
  contact: {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    address: { city: 'Amsterdam', country: 'Netherlands' },
  },
  work: [{ company: 'Analytical Engines', title: 'Mathematician', startDate: '1842-06', current: true, bullets: [] }],
  education: [{ school: 'University of London', degree: 'Bachelor of Science' }],
  skills: ['Algorithms', 'Calculus'],
  links: [],
  extra: {},
};

test.beforeEach(async ({ page }) => {
  await page.setContent(fixture);
  await page.addScriptTag({ content: bundle });
});

async function runFill(page: import('@playwright/test').Page) {
  return page.evaluate(async (d) => {
    const adapter = new (window as any).WorkdayAdapter();
    return adapter.fill(adapter.plan(d));
  }, DATA);
}

test('fills checkbox, dropdown, multiselect, and date; never submits', async ({ page }) => {
  const result = await runFill(page);

  // Checkbox (currentlyWorkHere) checked via controlled event.
  expect(await page.isChecked('[data-automation-id="formField-currentlyWorkHere"] input')).toBe(true);
  expect(await page.getAttribute('[data-automation-id="formField-currentlyWorkHere"] input', 'data-committed')).toBe('true');

  // Dropdown (degree) selected the matching option.
  expect(await page.getAttribute('[data-automation-id="formField-degree"] button', 'data-selected')).toBe('Bachelor of Science');

  // City text + Country dropdown from the structured address.
  expect(await page.inputValue('[data-automation-id="formField-city"] input')).toBe('Amsterdam');
  expect(await page.getAttribute('[data-automation-id="formField-country"] button', 'data-selected')).toBe('Netherlands');

  // Multiselect (skills) added a chip per matching value.
  const chips = await page.locator('[data-automation-id="formField-skills"] [data-automation-id="selectedItem"]').allTextContents();
  expect(chips).toEqual(['Algorithms', 'Calculus']);

  // Date sections written via native setter (1842-06 → month 6, year 1842).
  expect(await page.inputValue('[data-automation-id="dateSectionMonth-input"]')).toBe('6');
  expect(await page.inputValue('[data-automation-id="dateSectionYear-input"]')).toBe('1842');

  // Result and no-submit.
  expect(result.filled).toBeGreaterThanOrEqual(4);
  expect(await page.evaluate(() => (window as any).__submitted)).toBe(false);
});

test('unmatched dropdown option is reported, not thrown', async ({ page }) => {
  const result = await page.evaluate(async (d) => {
    const adapter = new (window as any).WorkdayAdapter();
    const data = { ...d, education: [{ school: 'X', degree: 'Nonexistent Degree' }] };
    return adapter.fill(adapter.plan(data));
  }, DATA);
  expect(result.skipped).toBeGreaterThanOrEqual(1);
  expect(result.errors.join(' ')).toContain('Degree');
});
