// Dev tool: render the BUILT side panel with a stubbed chrome.storage and screenshot it
// in light + dark, in both empty and populated states. Output: e2e/.tmp/panel-*.png
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, extname } from 'node:path';
import { mkdirSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '.tmp');
mkdirSync(outDir, { recursive: true });

// Serve the built extension over http (the build uses root-absolute asset paths).
const root = resolve(here, '../.output/chrome-mv3');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const server = createServer((req, res) => {
  try {
    const path = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    const body = readFileSync(path);
    res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, r));
const panelUrl = `http://127.0.0.1:${server.address().port}/sidepanel.html`;

const SAMPLE = {
  contact: {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    phone: '31612345678',
    location: 'Amsterdam',
    address: { line1: 'Herengracht 1', city: 'Amsterdam', postalCode: '1011 AB', country: 'Netherlands' },
  },
  work: [
    {
      company: 'Analytical Engines',
      title: 'Lead Mathematician',
      startDate: '2019-01',
      current: true,
      bullets: ['Designed the first algorithm', 'Scaled computation by 40%'],
    },
  ],
  education: [{ school: 'University of London', degree: 'BSc', field: 'Mathematics' }],
  skills: ['Algorithms', 'Calculus', 'Python'],
  links: [{ label: 'linkedin', url: 'https://linkedin.com/in/ada' }],
  extra: {},
};

const stubChrome = (data) => `
  window.chrome = {
    storage: {
      local: { get: async () => (${data} ? { applicantData: ${data} } : {}), set: async () => {}, remove: async () => {} },
      sync: { get: async () => ({}), set: async () => {}, remove: async () => {} },
      onChanged: { addListener: () => {} },
    },
    tabs: { query: async () => [], sendMessage: async () => { throw new Error('no tab'); } },
    runtime: { onMessage: { addListener: () => {} } },
  };
`;

const browser = await chromium.launch();
for (const scheme of ['light', 'dark']) {
  for (const [state, data] of [['empty', 'null'], ['filled', JSON.stringify(SAMPLE)]]) {
    const context = await browser.newContext({
      colorScheme: scheme,
      viewport: { width: 400, height: 900 },
    });
    const page = await context.newPage();
    await page.addInitScript(stubChrome(data));
    await page.goto(panelUrl);
    await page.waitForTimeout(700);
    const file = resolve(outDir, `panel-${state}-${scheme}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log('wrote', file);
    await context.close();
  }
}
await browser.close();
server.close();
