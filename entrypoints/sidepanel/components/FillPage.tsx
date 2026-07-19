import { useEffect, useState } from 'react';
import type { ApplicantData } from '@/src/types/applicant-data';
import type { FieldFill, FillResult } from '@/src/core/site-adapter/types';
import { requestPlan, requestFill, requestResumeUpload } from '../page-fill';

interface FillPageProps {
  data: ApplicantData;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'not-fillable' }
  | { kind: 'planned'; fields: FieldFill[] }
  | { kind: 'filled'; result: FillResult };

export function FillPage({ data }: FillPageProps) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [busy, setBusy] = useState(false);
  const [attachMsg, setAttachMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function attachResume() {
    setBusy(true);
    setAttachMsg(null);
    try {
      const res = await requestResumeUpload();
      setAttachMsg(
        res.ok
          ? { ok: true, text: 'Résumé attached to this page.' }
          : { ok: false, text: res.error ?? 'Could not attach résumé.' },
      );
    } finally {
      setBusy(false);
    }
  }

  async function preview() {
    setBusy(true);
    try {
      const fields = await requestPlan(data);
      setStatus(fields === null ? { kind: 'not-fillable' } : { kind: 'planned', fields });
    } finally {
      setBusy(false);
    }
  }

  async function fill(fields: FieldFill[]) {
    setBusy(true);
    try {
      setStatus({ kind: 'filled', result: await requestFill(fields) });
    } finally {
      setBusy(false);
    }
  }

  // Auto-review on open (and whenever the applicant data changes): the content script
  // auto-fills empty fields on the page; this shows what's mapped so the user can review.
  useEffect(() => {
    void preview();
  }, [data]);

  return (
    <details className="section" open>
      <summary>
        Workday page
        {status.kind === 'planned' && status.fields.length > 0 && (
          <span className="count">{status.fields.length} field(s)</span>
        )}
      </summary>
      <div className="section-body">
        <div className="hint">
          Empty fields fill automatically as they appear. Review here or on the page; “Fill
          now” re-applies everything.
        </div>

        <div className="row">
          <button className="btn btn-ghost btn-sm" disabled={busy} onClick={preview}>
            {busy ? 'Working…' : 'Refresh'}
          </button>
          <button className="btn btn-ghost btn-sm" disabled={busy} onClick={attachResume}>
            Attach résumé
          </button>
        </div>
        {attachMsg && (
          <div className={attachMsg.ok ? 'text-success' : 'text-warn'}>{attachMsg.text}</div>
        )}

        {status.kind === 'not-fillable' && (
          <span className="pill pill-muted">Not a Workday application page</span>
        )}

        {status.kind === 'planned' &&
          (status.fields.length === 0 ? (
            <span className="pill pill-muted">No matching fields on this step</span>
          ) : (
            <>
              {status.fields.map((f) => (
                <div key={f.selector} className="diff-row">
                  <div className="diff-label">{f.label}</div>
                  <div className="diff-values">
                    <span className={f.currentValue ? 'diff-old' : 'diff-old empty'}>
                      {f.currentValue || 'empty'}
                    </span>
                    <span aria-hidden>→</span>
                    <span className="diff-new">{f.value}</span>
                  </div>
                </div>
              ))}
              <div className="row">
                <button className="btn btn-primary" disabled={busy} onClick={() => fill(status.fields)}>
                  Fill now ({status.fields.length})
                </button>
              </div>
              <div className="hint">
                “Fill now” overwrites these field(s). The form is never submitted for you.
              </div>
            </>
          ))}

        {status.kind === 'filled' && (
          <div className="row">
            <span className="pill pill-success">Filled {status.result.filled}</span>
            {status.result.skipped > 0 && (
              <span className="pill pill-warn">Skipped {status.result.skipped}</span>
            )}
          </div>
        )}
        {status.kind === 'filled' &&
          status.result.errors.map((e, i) => (
            <div key={i} className="text-danger">{e}</div>
          ))}
      </div>
    </details>
  );
}
