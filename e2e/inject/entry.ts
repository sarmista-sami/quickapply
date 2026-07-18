// Injected into the fixture page by the e2e. Exposes the REAL Workday adapter + helpers on
// window so the test drives the same code the extension ships.
import { WorkdayAdapter } from '../../src/site-adapters/workday/index';
import { attachResume } from '../../src/site-adapters/workday/resume-upload';

const w = window as unknown as {
  WorkdayAdapter: typeof WorkdayAdapter;
  attachResume: typeof attachResume;
};
w.WorkdayAdapter = WorkdayAdapter;
w.attachResume = attachResume;
