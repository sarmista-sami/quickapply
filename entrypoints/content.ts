import { WorkdayAdapter } from '@/src/site-adapters/workday';
import { attachResume } from '@/src/site-adapters/workday/resume-upload';
import { autofillEmpty } from '@/src/site-adapters/workday/autofill';
import { storedToFile } from '@/src/storage/resume-file-store';
import { SyncedStorageAdapter } from '@/src/storage/synced-storage-adapter';
import type { ApplicantData } from '@/src/types/applicant-data';
import type {
  PanelToContent,
  PlanResponse,
  FillResponse,
  UploadResumeResponse,
} from '@/src/messaging/protocol';

// Content script for Workday application pages. Auto-fills detected empty fields from the
// stored ApplicantData (on load + as fields render) and handles panel messages. Never
// submits the form.
export default defineContentScript({
  matches: ['*://*.myworkdayjobs.com/*', '*://*.myworkday.com/*'],
  async main() {
    const adapter = new WorkdayAdapter();

    // --- Auto-fill on detection ---------------------------------------------
    if (adapter.matches(location.href)) {
      const storage = new SyncedStorageAdapter();
      const runner = createAutofillRunner(adapter, await storage.load().catch(() => null));
      // Panel edits mid-application (multi-step SPA): reload data and refill.
      chrome.storage.onChanged.addListener(() => {
        storage
          .load()
          .then((data) => runner.setData(data))
          .catch(() => {});
      });
    }

    chrome.runtime.onMessage.addListener((message: PanelToContent, _sender, sendResponse) => {
      if (!adapter.matches(location.href)) {
        // Typed per-request error responses so the panel never misparses the shape.
        if (message.type === 'plan-request') {
          sendResponse({ type: 'plan-response', fields: [] } satisfies PlanResponse);
        } else if (message.type === 'fill-request') {
          sendResponse({
            type: 'fill-response',
            result: { filled: 0, skipped: message.fields.length, errors: ['Not a Workday page'] },
          } satisfies FillResponse);
        } else {
          sendResponse({
            type: 'upload-resume-response',
            ok: false,
            error: 'Not a Workday page',
          } satisfies UploadResumeResponse);
        }
        return false;
      }

      if (message.type === 'plan-request') {
        sendResponse({ type: 'plan-response', fields: adapter.plan(message.data) } satisfies PlanResponse);
        return false; // responded synchronously
      }

      if (message.type === 'upload-resume-request') {
        try {
          const ok = attachResume(storedToFile(message.file));
          sendResponse({ type: 'upload-resume-response', ok } satisfies UploadResumeResponse);
        } catch (err) {
          sendResponse({ type: 'upload-resume-response', ok: false, error: String(err) } satisfies UploadResumeResponse);
        }
        return false;
      }

      if (message.type === 'fill-request') {
        adapter
          .fill(message.fields)
          .then((result) => sendResponse({ type: 'fill-response', result } satisfies FillResponse))
          .catch((err: unknown) =>
            sendResponse({
              type: 'fill-response',
              result: { filled: 0, skipped: message.fields.length, errors: [String(err)] },
            } satisfies FillResponse),
          );
        return true; // async response
      }

      return false;
    });
  },
});

/**
 * Debounced autofill runner. Fills empty fields now and on page mutations. Owns the
 * attempted-set (one try per field/value per step) and resets it when the SPA URL
 * changes (Workday steps navigate without a reload). Empty-only + attempted-set keep it
 * idempotent: no clobbering, no loops.
 */
function createAutofillRunner(adapter: WorkdayAdapter, initial: ApplicantData | null) {
  let data = initial;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running = false;
  let lastHref = location.href;
  const attempted = new Set<string>();

  const run = async () => {
    if (!data || running) return;
    running = true;
    try {
      if (location.href !== lastHref) {
        lastHref = location.href;
        attempted.clear(); // new step — fields may legitimately repeat
      }
      await autofillEmpty(adapter, data, attempted);
    } catch {
      /* best-effort */
    } finally {
      running = false;
    }
  };

  void run();

  const observer = new MutationObserver(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void run(), 400);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  return {
    setData(next: ApplicantData | null) {
      data = next;
      attempted.clear(); // data changed — previously attempted values may now differ
      void run();
    },
  };
}