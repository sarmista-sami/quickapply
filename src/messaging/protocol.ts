import type { FieldFill, FillResult } from '@/src/core/site-adapter/types';

/**
 * Typed message protocol between the side panel and the content script.
 * Definitions only — no transport logic yet (Stage 4 wires this up).
 */

/** Side panel → content: ask the active adapter what it would fill. */
export interface PlanRequest {
  type: 'plan-request';
}

/** Content → side panel: the planned writes, for user review before filling. */
export interface PlanResponse {
  type: 'plan-response';
  fields: FieldFill[];
}

/** Side panel → content: perform the (user-approved) writes. */
export interface FillRequest {
  type: 'fill-request';
  fields: FieldFill[];
}

/** Content → side panel: outcome of the fill. */
export interface FillResponse {
  type: 'fill-response';
  result: FillResult;
}

export type PanelToContent = PlanRequest | FillRequest;
export type ContentToPanel = PlanResponse | FillResponse;
export type Message = PanelToContent | ContentToPanel;
