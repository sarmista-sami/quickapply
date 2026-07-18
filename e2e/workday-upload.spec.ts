import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(join(here, 'fixtures/workday-upload.html'), 'utf8');
const bundle = readFileSync(join(here, '.tmp/workday-adapter.js'), 'utf8');

const INPUT = '[data-automation-id="file-upload-input-ref"]';

test.beforeEach(async ({ page }) => {
  await page.setContent(fixture);
  await page.addScriptTag({ content: bundle });
});

test('attaches a résumé file to the Workday file input; no submit', async ({ page }) => {
  const ok = await page.evaluate(() => {
    const file = new File([new Uint8Array([1, 2, 3])], 'ada-resume.docx', { type: 'application/octet-stream' });
    return (window as any).attachResume(file);
  });
  expect(ok).toBe(true);
  expect(await page.locator(INPUT).evaluate((el: HTMLInputElement) => el.files?.[0]?.name)).toBe('ada-resume.docx');
  expect(await page.getAttribute(INPUT, 'data-changed')).toBe('true');
  expect(await page.evaluate(() => (window as any).__submitted)).toBe(false);
});

test('reports failure when no file input is present', async ({ page }) => {
  await page.setContent('<div>no upload here</div>');
  await page.addScriptTag({ content: bundle });
  const ok = await page.evaluate(() => {
    const file = new File([new Uint8Array([1])], 'x.docx', { type: 'application/octet-stream' });
    return (window as any).attachResume(file);
  });
  expect(ok).toBe(false);
});
