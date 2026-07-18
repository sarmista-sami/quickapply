import { useEffect, useMemo, useState } from 'react';
import type { ApplicantData } from '@/src/types/applicant-data';
import type { StoragePort } from '@/src/core/applicant-data/storage-port';
import { SyncedStorageAdapter } from '@/src/storage/synced-storage-adapter';
import { ResumeFileStore } from '@/src/storage/resume-file-store';
import { validateApplicant } from './validation';
import { Upload } from './components/Upload';
import { Preview } from './components/Preview';
import { FillPage } from './components/FillPage';
import { ui } from './components/fields';

export function App() {
  const [data, setData] = useState<ApplicantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [syncWarning, setSyncWarning] = useState<string | null>(null);

  // Depend on the port, not the concrete adapter. onWarning surfaces quota fallback.
  const storage: StoragePort = useMemo(
    () => new SyncedStorageAdapter({ onWarning: setSyncWarning }),
    [],
  );

  useEffect(() => {
    storage
      .load()
      .then(setData)
      .catch((err: unknown) => console.error('load failed', err))
      .finally(() => setLoading(false));
  }, [storage]);

  const { valid, errors } = useMemo(
    () => (data ? validateApplicant(data) : { valid: false, errors: {} }),
    [data],
  );

  async function save() {
    if (!data || !valid) return;
    setSyncWarning(null);
    await storage.save(data);
    setSavedAt(new Date().toLocaleTimeString());
  }

  async function clearAll() {
    if (!confirm('Clear all saved résumé data on this device and your account?')) return;
    await Promise.all([storage.clear(), new ResumeFileStore().clear()]);
    setData(null);
    setSavedAt(null);
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
          {syncWarning && (
            <div style={{ ...ui.error, marginTop: '0.4rem', color: '#b45309' }}>{syncWarning}</div>
          )}
          <FillPage data={data} />
          <button
            style={{ ...ui.ghostButton, marginTop: '0.75rem', color: '#b91c1c' }}
            onClick={clearAll}
          >
            Clear saved data
          </button>
        </>
      )}
    </main>
  );
}
