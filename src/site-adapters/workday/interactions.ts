import { setNativeValue, waitForField, pressEnter } from '@/src/site-adapters/workday/dom';

/**
 * Edge DOM interaction strategies for Workday's non-text widgets. All are best-effort and
 * bounded by timeouts; callers record failures rather than throwing. None target a submit
 * or continue control. Live widget behavior can differ per tenant — validated against
 * fixtures modeled on captured markup, plus a manual real-page pass.
 */

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function q<T extends Element>(selector: string): T | null {
  return document.querySelector<T>(selector);
}

/** Wait for a Workday option (rendered in a portal) whose text matches `value`. */
async function waitForOption(value: string, timeout = 3000): Promise<HTMLElement | null> {
  const norm = value.trim().toLowerCase();
  const deadline = Date.now() + timeout;
  for (;;) {
    const opts = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-automation-id="promptOption"], [data-automation-id="menuItem"]',
      ),
    ).filter((o) => o.offsetParent !== null || o.getClientRects().length > 0);
    const text = (o: HTMLElement) => (o.textContent || '').trim().toLowerCase();
    const exact = opts.find((o) => text(o) === norm);
    if (exact) return exact;
    const contains = opts.find((o) => text(o).includes(norm));
    if (contains) return contains;
    if (Date.now() >= deadline) return null;
    await wait(100);
  }
}

function closeListbox(): void {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
}

export async function fillText(
  wrapperSel: string,
  value: string,
  tag: 'input' | 'textarea' = 'input',
): Promise<boolean> {
  const el = await waitForField(`${wrapperSel} ${tag}`);
  if (!el) return false;
  setNativeValue(el, value);
  return true;
}

export async function setCheckbox(wrapperSel: string, checked: boolean): Promise<boolean> {
  const el = q<HTMLInputElement>(`${wrapperSel} input[type="checkbox"]`);
  if (!el) return false;
  if (el.checked !== checked) el.click();
  return true;
}

export async function selectDropdown(wrapperSel: string, value: string): Promise<boolean> {
  const button = q<HTMLElement>(`${wrapperSel} button`);
  if (!button) return false;
  button.click();
  await wait(150);
  // Some Workday dropdowns are searchable — typing filters the list.
  const search = q<HTMLInputElement>(`${wrapperSel} input[type="text"]`);
  if (search) setNativeValue(search, value);
  const option = await waitForOption(value);
  if (!option) {
    closeListbox();
    return false;
  }
  option.click();
  return true;
}

/** Poll a predicate until true or timeout. */
async function waitUntil(pred: () => boolean, timeout = 1000, interval = 80): Promise<boolean> {
  const deadline = Date.now() + timeout;
  for (;;) {
    if (pred()) return true;
    if (Date.now() >= deadline) return false;
    await wait(interval);
  }
}

export async function selectMultiple(
  wrapperSel: string,
  values: string[],
): Promise<{ added: number; skipped: string[] }> {
  const input = q<HTMLInputElement>(`${wrapperSel} input`);
  const skipped: string[] = [];
  let added = 0;
  if (!input) return { added, skipped: values };

  const chipCount = () =>
    document.querySelectorAll(`${wrapperSel} [data-automation-id="selectedItem"]`).length;

  for (const value of values) {
    const before = chipCount();
    input.focus();
    setNativeValue(input, value); // input event triggers the typeahead search

    // Let the suggestion list render, then commit with Enter — Workday's prompt accepts
    // the highlighted option on Enter, and a plain option click often does NOT register.
    const option = await waitForOption(value, 1000);
    pressEnter(input);
    let ok = await waitUntil(() => chipCount() > before, 800);

    // Fallback: click the matched option if Enter didn't add a chip.
    if (!ok && option) {
      option.click();
      ok = await waitUntil(() => chipCount() > before, 600);
    }

    if (ok) added += 1;
    else skipped.push(value);

    setNativeValue(input, ''); // clear for the next value (Workday usually auto-clears)
    await wait(100);
  }
  return { added, skipped };
}

/**
 * Click a repeatable section's "Add" button, identified by a heading near an add-button
 * whose text matches `name`. Returns whether a button was clicked. Best-effort — used only
 * to reveal a section whose fields are absent; never targets a submit control.
 */
export function clickAddForSection(name: RegExp): boolean {
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('button[data-automation-id="add-button"]'),
  );
  for (const btn of buttons) {
    const label = (btn.getAttribute('aria-label') || btn.textContent || '').trim();
    if (name.test(label)) {
      btn.click();
      return true;
    }
    let node: HTMLElement | null = btn.parentElement;
    for (let depth = 0; depth < 6 && node; depth += 1, node = node.parentElement) {
      const heading = node.querySelector<HTMLElement>(
        'h1,h2,h3,h4,h5,[role="heading"],[data-automation-id*="itle"],[data-automation-id*="eading"],label',
      );
      if (heading && name.test((heading.textContent || '').trim())) {
        btn.click();
        return true;
      }
    }
  }
  return false;
}

interface DateParts {
  month?: string;
  year?: string;
}

export function parseDate(value: string): DateParts {
  // Month is zero-padded — Workday's MM section expects two digits.
  const pad = (m: string) => String(Number(m)).padStart(2, '0');
  const ym = value.match(/(\d{4})[-/](\d{1,2})/);
  if (ym) return { year: ym[1], month: pad(ym[2]!) };
  const my = value.match(/(\d{1,2})[-/](\d{4})/);
  if (my) return { year: my[2], month: pad(my[1]!) };
  const y = value.match(/(\d{4})/);
  if (y) return { year: y[1] };
  return {};
}

export async function setDate(wrapperSel: string, value: string): Promise<boolean> {
  const { month, year } = parseDate(value);
  if (!year) return false;
  const monthEl = q<HTMLInputElement>(`${wrapperSel} [data-automation-id="dateSectionMonth-input"]`);
  const yearEl = q<HTMLInputElement>(`${wrapperSel} [data-automation-id="dateSectionYear-input"]`);
  if (month && monthEl) setNativeValue(monthEl, month);
  if (yearEl) setNativeValue(yearEl, year);
  return Boolean(yearEl || monthEl);
}
