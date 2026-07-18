import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Build the injectable adapter bundle before the e2e run.
export default function globalSetup(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  execFileSync(process.execPath, [join(here, 'build-inject.mjs')], { stdio: 'inherit' });
}
