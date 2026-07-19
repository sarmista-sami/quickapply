import { useEffect, useMemo, useState } from 'react';
import type { ApplicantData } from '@/src/types/applicant-data';
import type { StoragePort } from '@/src/core/applicant-data/storage-port';
import { SyncedStorageAdapter } from '@/src/storage/synced-storage-adapter';
import { ResumeFileStore } from '@/src/storage/resume-file-store';
import { validateApplicant } from './validation';
import { Upload } from './components/Upload';
import { Preview } from './components/Preview';
import { FillPage } from './components/FillPage';

function Logo() {
  return (
    <div className="app-logo" aria-hidden>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2 3 14h7l-1 8 10-12h-7z" />
      </svg>
    </div>
  );
}

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
    setSyncWarning(null);
  }

  return (
    <div className="app">
      <header className="app-header">
        <Logo />
        <div>
          <h1 className="app-title">Resume Autofill</h1>
          <p className="app-subtitle">Parse once, apply everywhere</p>
        </div>
      </header>

      <main className="app-main">
        {loading ? (
          <div className="hint">Loading…</div>
        ) : !data ? (
          <>
            <div className="hint">
              Upload your résumé to get started. Every field is yours to review and edit
              before anything is saved or filled.
            </div>
            <Upload variant="zone" onParsed={setData} />
          </>
        ) : (
          <>
            <div className="row">
              <Upload variant="button" onParsed={setData} />
            </div>
            <FillPage data={data} />
            <Preview data={data} errors={errors} onChange={setData} />
          </>
        )}
      </main>

      {data && (
        <footer className="savebar">
          <button className="btn btn-primary" disabled={!valid} onClick={save}>
            Save
          </button>
          {!valid && <span className="text-danger">Fix the highlighted fields to save.</span>}
          {valid && savedAt && <span className="text-success">Saved at {savedAt}</span>}
          {syncWarning && <span className="text-warn">{syncWarning}</span>}
          <span className="spacer" />
          <button className="btn btn-danger btn-sm" onClick={clearAll}>
            Clear data
          </button>
        </footer>
      )}
    </div>
  );
}
