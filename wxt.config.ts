import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: '.',
  manifest: {
    name: 'Resume Autofill',
    description: 'Parse a resume and pre-fill job-application forms.',
    permissions: ['sidePanel', 'storage', 'activeTab'],
    // activeTab lets the panel message the active Workday tab (user-invoked). Still no
    // broad host_permissions — the content script is scoped to Workday domains only.
    action: {},
  },
});
