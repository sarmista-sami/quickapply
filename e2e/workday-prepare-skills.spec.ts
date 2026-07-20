import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const bundle = readFileSync(join(here, '.tmp/workday-adapter.js'), 'utf8');
const skillsFixture = readFileSync(join(here, 'fixtures/workday-skills-enter.html'), 'utf8');
const eduFixture = readFileSync(join(here, 'fixtures/workday-add-education.html'), 'utf8');

test('skills commit via Enter when option-click does not (chip added)', async ({ page }) => {
  await page.setContent(skillsFixture);
  await page.addScriptTag({ content: bundle });

  const data = {
    contact: { firstName: 'A', lastName: 'B', email: 'a@b.com' },
    work: [],
    education: [],
    skills: ['Algorithms', 'Calculus'],
    links: [],
    extra: {},
  };
  const result = await page.evaluate(async (d) => {
    const adapter = new (window as any).WorkdayAdapter();
    return adapter.fill(adapter.plan(d));
  }, data);

  const chips = await page.locator('[data-automation-id="formField-skills"] [data-automation-id="selectedItem"]').allTextContents();
  expect(chips).toEqual(['Algorithms', 'Calculus']);
  expect(result.filled).toBeGreaterThanOrEqual(1);
  expect(await page.evaluate(() => (window as any).__submitted)).toBe(false);
});

test('prepare() clicks Education "Add" so the degree field renders and fills', async ({ page }) => {
  await page.setContent(eduFixture);
  await page.addScriptTag({ content: bundle });

  const data = {
    contact: { firstName: 'A', lastName: 'B', email: 'a@b.com' },
    work: [],
    education: [{ school: 'MIT', degree: 'Bachelor of Science' }],
    skills: [],
    links: [],
    extra: {},
  };

  // Degree field is absent before prepare.
  expect(await page.locator('[data-automation-id="formField-degree"]').count()).toBe(0);

  const first = await page.evaluate(async (d) => {
    const adapter = new (window as any).WorkdayAdapter();
    return (window as any).autofillEmpty(adapter, d);
  }, data);

  // Add was clicked once, degree rendered and was selected.
  expect(await page.evaluate(() => (window as any).__eduAdds)).toBe(1);
  expect(await page.getAttribute('[data-automation-id="formField-degree"] button', 'data-selected')).toBe('Bachelor of Science');
  expect(first.filled).toBeGreaterThanOrEqual(1);

  // Second pass must NOT click Add again (field now present) and must not re-fill.
  const second = await page.evaluate(async (d) => {
    const adapter = new (window as any).WorkdayAdapter();
    return (window as any).autofillEmpty(adapter, d);
  }, data);
  expect(await page.evaluate(() => (window as any).__eduAdds)).toBe(1);
  expect(second.filled).toBe(0);
  expect(await page.evaluate(() => (window as any).__submitted)).toBe(false);
});
