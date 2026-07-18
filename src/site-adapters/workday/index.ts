import type { SiteAdapter, FieldFill, FillResult } from '@/src/core/site-adapter/types';
import type { ApplicantData } from '@/src/types/applicant-data';
import { NotImplemented } from '@/src/core/errors';

const WORKDAY_HOST = /(^|\.)(myworkdayjobs|myworkday)\.com$/i;

/**
 * Edge adapter for Workday job-application forms. Lives OUTSIDE `src/core`
 * because `fill()` mutates the DOM (AGENTS.md rule 2). `matches()` is pure and
 * implemented; `plan()`/`fill()` are stubs until Stage 4.
 */
export class WorkdayAdapter implements SiteAdapter {
  matches(url: string): boolean {
    try {
      return WORKDAY_HOST.test(new URL(url).hostname);
    } catch {
      return false;
    }
  }

  plan(_data: ApplicantData): FieldFill[] {
    throw new NotImplemented('WorkdayAdapter.plan (Stage 4)');
  }

  fill(_plan: FieldFill[]): Promise<FillResult> {
    throw new NotImplemented('WorkdayAdapter.fill (Stage 4)');
  }
}
