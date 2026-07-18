// Stub content script. Injection point for the site-adapter form filler (Stage 4).
// Currently performs no page mutation. Scoped to Workday domains (first target);
// widen or add adapters in later stages. No host_permissions are requested.
export default defineContentScript({
  matches: ['*://*.myworkdayjobs.com/*', '*://*.myworkday.com/*'],
  main() {
    // no-op — Stage 4 wires this to the site adapter via the messaging protocol.
  },
});
