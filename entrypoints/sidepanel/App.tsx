import { useEffect, useMemo, useState } from 'react';
import type { ApplicantData } from '@/src/types/applicant-data';
import type { StoragePort } from '@/src/core/applicant-data/storage-port';
import { LocalStorageAdapter } from '@/src/storage/local-storage-adapter';
import { validateApplicant } from './validation';
import { Upload } from './components/Upload';
import { Preview } from './components/Preview';
import { ui } from './components/fields';

// Depend on the port, not the concrete adapter — Stage 3 swaps this one line.
const storage: StoragePort = new LocalStorageAdapter();

export function App() {
  const [data, setData] = useState<ApplicantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    storage
      .load()
      .then(setData)
      .catch((err: unknown) => console.error('load failed', err))
      .finally(() => setLoading(false));
  }, []);

  const { valid, errors } = useMemo(
    () => (data ? validateApplicant(data) : { valid: false, errors: {} }),
    [data],
  );

  async function save() {
    if (!data || !valid) return;
    await storage.save(data);
    setSavedAt(new Date().toLocaleTimeString());
  }

  if (loading) return <main style={ui.page}>Loading…</main>;

  return (
    <main style={ui.page}>
      <h1 style={ui.h1}>Resume Autofill</h1>

      {!data ? (
        <>
          <p style={{ color: '#666', fontSize: '0.85rem' }}>
            Upload a .docx résumé to get started. You review and edit everything before it is saved.
          </p>
          <Upload onParsed={setData} />
        </>
      ) : (
        <>
          <Upload onParsed={setData} label="Replace with another .docx" />
          <Preview data={data} errors={errors} onChange={setData} />
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: '0.5rem' }}>
            <button
              style={{ ...ui.button, ...(valid ? {} : ui.buttonDisabled) }}
              disabled={!valid}
              onClick={save}
            >
              Save
            </button>
            {!valid && <span style={ui.error}>Fix the highlighted fields to save.</span>}
            {valid && savedAt && (
              <span style={{ color: '#0a0', fontSize: '0.75rem' }}>Saved at {savedAt}</span>
            )}
          </div>
        </>
      )}
    </main>
  );
}
