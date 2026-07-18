import { describe, it, expect } from 'vitest';
import { WorkdayAdapter } from '@/src/site-adapters/workday';
import { NotImplemented } from '@/src/core/errors';

describe('WorkdayAdapter stub', () => {
  const adapter = new WorkdayAdapter();

  it('matches Workday domains', () => {
    expect(adapter.matches('https://acme.wd5.myworkdayjobs.com/en-US/careers')).toBe(true);
    expect(adapter.matches('https://www.greenhouse.io/jobs/123')).toBe(false);
  });

  it('exposes plan and fill as distinct members', () => {
    expect(typeof adapter.plan).toBe('function');
    expect(typeof adapter.fill).toBe('function');
    expect(adapter.plan).not.toBe(adapter.fill);
  });

  it('plan throws NotImplemented until Stage 4', () => {
    const data = {
      contact: { firstName: 'A', lastName: 'B', email: 'a@b.com' },
      work: [],
      education: [],
      skills: [],
      links: [],
      extra: {},
    };
    expect(() => adapter.plan(data)).toThrow(NotImplemented);
  });

  it('fill throws NotImplemented until Stage 4', () => {
    expect(() => adapter.fill([])).toThrow(NotImplemented);
  });
});
