/**
 * Edge helper: attach a résumé File to a Workday file input. Uses a DataTransfer to
 * populate `<input type=file>.files` (the reliable programmatic path in Chrome content
 * scripts) and dispatches a bubbling change event. Never submits.
 */
export function attachResume(file: File): boolean {
  const input =
    document.querySelector<HTMLInputElement>('input[data-automation-id="file-upload-input-ref"]') ??
    document.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) return false;

  const transfer = new DataTransfer();
  transfer.items.add(file);
  input.files = transfer.files;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  return input.files.length > 0;
}
