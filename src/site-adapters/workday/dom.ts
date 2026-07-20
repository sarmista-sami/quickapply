/**
 * DOM helpers for the Workday adapter. Edge code (uses the DOM) — never imported by
 * `src/core`. The native-setter write is the crux: assigning `input.value` directly
 * leaves React's internal value tracker stale so the app ignores the change; setting
 * through the prototype's setter and dispatching bubbling `input`/`change` events makes
 * controlled components register it.
 */

type Fillable = HTMLInputElement | HTMLTextAreaElement;

export function findInput(selector: string, root: ParentNode = document): Fillable | null {
  return root.querySelector<Fillable>(selector);
}

export function readValue(el: Fillable): string {
  return el.value;
}

export function setNativeValue(el: Fillable, value: string): void {
  const proto = Object.getPrototypeOf(el) as object;
  const descriptor =
    Object.getOwnPropertyDescriptor(proto, 'value') ??
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  if (descriptor?.set) {
    descriptor.set.call(el, value);
  } else {
    el.value = value; // fallback: plain assignment
  }
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Dispatch a real Enter keypress on an element. Workday's typeahead prompts commit the
 * highlighted option on Enter (an option click alone does not register). `keyCode`/`which`
 * are set for handlers that still read them.
 */
export function pressEnter(el: HTMLElement): void {
  for (const type of ['keydown', 'keypress', 'keyup'] as const) {
    const ev = new KeyboardEvent(type, { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true });
    Object.defineProperty(ev, 'keyCode', { get: () => 13 });
    Object.defineProperty(ev, 'which', { get: () => 13 });
    el.dispatchEvent(ev);
  }
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Poll for a field to appear (Workday renders lazily). Resolves null on timeout. */
export async function waitForField(
  selector: string,
  timeout = 5000,
  interval = 100,
  root: ParentNode = document,
): Promise<Fillable | null> {
  const deadline = Date.now() + timeout;
  for (;;) {
    const el = findInput(selector, root);
    if (el) return el;
    if (Date.now() >= deadline) return null;
    await wait(interval);
  }
}
