import type { FieldFill, FillResult } from '@/src/core/site-adapter/types';
import type { ApplicantData } from '@/src/types/applicant-data';

/**
 * Typed message protocol between the side panel and the content script.
 */

/** Side panel → content: ask the active adapter what it would fill for this data. */
export interface PlanRequest {
  type: 'plan-request';
  data: ApplicantData;
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

/** Side panel → content: attach a stored résumé file to the page's file input. */
export interface UploadResumeRequest {
  type: 'upload-resume-request';
  file: { name: string; type: string; dataBase64: string };
}

/** Content → side panel: outcome of the résumé attach. */
export interface UploadResumeResponse {
  type: 'upload-resume-response';
  ok: boolean;
  error?: string;
}

export type PanelToContent = PlanRequest | FillRequest | UploadResumeRequest;
export type ContentToPanel = PlanResponse | FillResponse | UploadResumeResponse;
export type Message = PanelToContent | ContentToPanel;
