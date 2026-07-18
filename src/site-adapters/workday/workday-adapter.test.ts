import { describe, it, expect } from 'vitest';
import { WorkdayAdapter } from '@/src/site-adapters/workday';

// Pure behavior only. plan()/fill() touch the DOM and are covered by the Playwright e2e.
describe('WorkdayAdapter.matches', () => {
  const adapter = new WorkdayAdapter();

  it('matches Workday tenant domains (wd3, wd5, …)', () => {
    expect(adapter.matches('https://pwc.wd3.myworkdayjobs.com/en-US/x/apply/applyManually')).toBe(true);
    expect(adapter.matches('https://paloaltonetworks.wd5.myworkdayjobs.com/en-US/x/job/y')).toBe(true);
    expect(adapter.matches('https://acme.myworkday.com/careers')).toBe(true);
  });

  it('rejects unrelated domains', () => {
    expect(adapter.matches('https://boards.greenhouse.io/acme/jobs/1')).toBe(false);
    expect(adapter.matches('not a url')).toBe(false);
  });

  it('exposes plan and fill as distinct members', () => {
    expect(typeof adapter.plan).toBe('function');
    expect(typeof adapter.fill).toBe('function');
    expect(adapter.plan).not.toBe(adapter.fill);
  });
});
