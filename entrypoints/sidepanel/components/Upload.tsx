import { useRef, useState, type ChangeEvent } from 'react';
import { parseResumeFile } from '../pipeline';
import type { ApplicantData } from '@/src/types/applicant-data';
import { ResumeFileStore } from '@/src/storage/resume-file-store';
import { ui } from './fields';

const resumeStore = new ResumeFileStore();

interface UploadProps {
  onParsed: (data: ApplicantData) => void;
  label?: string;
}

export function Upload({ onParsed, label = 'Upload résumé (.docx)' }: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const data = await parseResumeFile(file);
      // Retain the original file locally so it can be attached to applications later.
      await resumeStore.save(file).catch((err) => console.error('resume store failed', err));
      onParsed(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse résumé.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={ui.section}>
      <input
        ref={inputRef}
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        style={{ display: 'none' }}
        onChange={onFile}
      />
      <button
        style={{ ...ui.button, ...(busy ? ui.buttonDisabled : {}) }}
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? 'Parsing…' : label}
      </button>
      {error && <div style={{ ...ui.error, marginTop: '0.4rem' }}>{error}</div>}
    </div>
  );
}
