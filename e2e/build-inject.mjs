// Bundles the real Workday adapter into an IIFE for injection into the e2e fixture page.
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

// Resolve the project's `@/…` path alias to real files. Targets can be a file
// (`@/src/core/errors` -> errors.ts) or a directory whose index re-exports
// (`@/src/core/normalizer` -> normalizer/index.ts) — try both.
const aliasAt = {
  name: 'alias-at',
  setup(b) {
    b.onResolve({ filter: /^@\// }, (args) => {
      const base = join(root, args.path.slice(1));
      const asFile = `${base}.ts`;
      const path = existsSync(asFile) ? asFile : join(base, 'index.ts');
      return { path };
    });
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
