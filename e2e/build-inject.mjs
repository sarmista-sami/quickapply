// Bundles the real Workday adapter into an IIFE for injection into the e2e fixture page.
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

// Resolve the project's `@/…` path alias to real files (all sources are .ts).
const aliasAt = {
  name: 'alias-at',
  setup(b) {
    b.onResolve({ filter: /^@\// }, (args) => ({ path: join(root, args.path.slice(1) + '.ts') }));
  },
};

await build({
  entryPoints: [join(here, 'inject/entry.ts')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  outfile: join(here, '.tmp/workday-adapter.js'),
  plugins: [aliasAt],
  logLevel: 'warning',
});
