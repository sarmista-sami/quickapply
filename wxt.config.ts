import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: '.',
  manifest: {
    name: 'Resume Autofill',
    description: 'Parse a resume and pre-fill job-application forms.',
    permissions: ['sidePanel', 'storage'],
    // No host_permissions yet — added per site-adapter (Workday stage).
    action: {},
  },
});
