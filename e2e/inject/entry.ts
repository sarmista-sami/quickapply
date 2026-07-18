// Injected into the fixture page by the e2e. Exposes the REAL Workday adapter on window
// so the test drives the same plan/fill/native-setter code the extension ships.
import { WorkdayAdapter } from '../../src/site-adapters/workday/index';

(window as unknown as { WorkdayAdapter: typeof WorkdayAdapter }).WorkdayAdapter = WorkdayAdapter;
