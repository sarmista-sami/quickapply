import { setNativeValue, waitForField } from '@/src/site-adapters/workday/dom';

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

export async function selectMultiple(
  wrapperSel: string,
  values: string[],
): Promise<{ added: number; skipped: string[] }> {
  const input = q<HTMLInputElement>(`${wrapperSel} input`);
  const skipped: string[] = [];
  let added = 0;
  if (!input) return { added, skipped: values };
  for (const value of values) {
    input.focus();
    setNativeValue(input, value);
    const option = await waitForOption(value);
    if (option) {
      option.click();
      added += 1;
      setNativeValue(input, '');
      await wait(120);
    } else {
      skipped.push(value);
    }
  }
  return { added, skipped };
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
