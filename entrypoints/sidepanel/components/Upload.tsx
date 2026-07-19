import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { parseResumeFile } from '../pipeline';
import type { ApplicantData } from '@/src/types/applicant-data';
import { ResumeFileStore } from '@/src/storage/resume-file-store';

const resumeStore = new ResumeFileStore();

const ACCEPT =
  '.docx,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf';

interface UploadProps {
  onParsed: (data: ApplicantData) => void;
  /** 'zone' renders the full drop zone (empty state); 'button' a compact replace action. */
  variant?: 'zone' | 'button';
}

export function Upload({ onParsed, variant = 'zone' }: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File | undefined) {
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

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    void handleFile(file);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    void handleFile(e.dataTransfer.files?.[0]);
  }

  const picker = (
    <input ref={inputRef} type="file" accept={ACCEPT} style={{ display: 'none' }} onChange={onPick} />
  );

  if (variant === 'button') {
    return (
      <div>
        {picker}
        <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? 'Parsing…' : 'Replace résumé…'}
        </button>
        {error && <div className="text-danger" style={{ marginTop: 6 }}>{error}</div>}
      </div>
    );
  }

  return (
    <div>
      {picker}
      <div
        className={dragging ? 'dropzone dragging' : 'dropzone'}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <svg className="dz-icon" width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M12 18v-6" />
          <path d="m9 15 3 3 3-3" transform="rotate(180 12 15.5)" />
        </svg>
        <div className="dz-title">{busy ? 'Parsing résumé…' : 'Drop your résumé here'}</div>
        <div className="dz-hint">or click to browse — .docx and .pdf supported</div>
      </div>
      {error && <div className="text-danger" style={{ marginTop: 8 }}>{error}</div>}
    </div>
  );
}
