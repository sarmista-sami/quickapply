import type { ApplicantData } from '@/src/types/applicant-data';
import type { FieldFill, FillResult } from '@/src/core/site-adapter/types';
import type { PlanResponse, FillResponse } from '@/src/messaging/protocol';

async function activeTabId(): Promise<number | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}

/**
 * Ask the active tab's content script what it would fill.
 * Returns `null` when the tab has no Workday content script (not a fillable page).
 */
export async function requestPlan(data: ApplicantData): Promise<FieldFill[] | null> {
  const id = await activeTabId();
  if (id === undefined) return null;
  try {
    const res = (await chrome.tabs.sendMessage(id, { type: 'plan-request', data })) as
      | PlanResponse
      | undefined;
    return res?.fields ?? [];
  } catch {
    // No receiver on this tab → content script not present → not a Workday page.
    return null;
  }
}

export async function requestFill(fields: FieldFill[]): Promise<FillResult> {
  const id = await activeTabId();
  const fallback: FillResult = { filled: 0, skipped: fields.length, errors: ['No active tab'] };
  if (id === undefined) return fallback;
  try {
    const res = (await chrome.tabs.sendMessage(id, { type: 'fill-request', fields })) as
      | FillResponse
      | undefined;
    return res?.result ?? { filled: 0, skipped: fields.length, errors: ['No response'] };
  } catch (err) {
    return { filled: 0, skipped: fields.length, errors: [String(err)] };
  }
}
