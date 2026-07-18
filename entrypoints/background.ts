export default defineBackground(() => {
  // Open the side panel when the toolbar action is clicked.
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((err: unknown) => console.error('Failed to set side panel behavior:', err));
});
