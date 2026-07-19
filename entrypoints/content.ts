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
      const data = await new SyncedStorageAdapter().load().catch(() => null);
      if (data) startAutofill(adapter, data);
    }

    chrome.runtime.onMessage.addListener((message: PanelToContent, _sender, sendResponse) => {
      if (!adapter.matches(location.href)) {
        sendResponse({ type: 'plan-response', fields: [] } satisfies PlanResponse);
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
 * Run an empty-only autofill pass now, then again (debounced) whenever the page mutates,
 * so lazily rendered and multi-step fields get filled. Empty-only keeps it idempotent —
 * filled fields are skipped next pass, so the fill's own events don't cause a loop.
 */
function startAutofill(adapter: WorkdayAdapter, data: ApplicantData): void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running = false;

  const run = async () => {
    if (running) return;
    running = true;
    try {
      await autofillEmpty(adapter, data);
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
}
