import { WorkdayAdapter } from '@/src/site-adapters/workday';
import type { PanelToContent, PlanResponse, FillResponse } from '@/src/messaging/protocol';

// Content script for Workday application pages. Handles preview/fill requests from the
// side panel by delegating to the Workday adapter. Never submits the form.
export default defineContentScript({
  matches: ['*://*.myworkdayjobs.com/*', '*://*.myworkday.com/*'],
  main() {
    const adapter = new WorkdayAdapter();

    chrome.runtime.onMessage.addListener((message: PanelToContent, _sender, sendResponse) => {
      if (!adapter.matches(location.href)) {
        sendResponse({ type: 'plan-response', fields: [] } satisfies PlanResponse);
        return false;
      }

      if (message.type === 'plan-request') {
        sendResponse({ type: 'plan-response', fields: adapter.plan(message.data) } satisfies PlanResponse);
        return false; // responded synchronously
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
