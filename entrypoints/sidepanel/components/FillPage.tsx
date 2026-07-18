import { useState } from 'react';
import type { ApplicantData } from '@/src/types/applicant-data';
import type { FieldFill, FillResult } from '@/src/core/site-adapter/types';
import { requestPlan, requestFill } from '../page-fill';
import { ui } from './fields';

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

  return (
    <section style={{ ...ui.section, borderTop: '1px solid #e5e5e5', paddingTop: '0.75rem' }}>
      <h2 style={ui.h2}>Fill this Workday page</h2>

      <button
        style={{ ...ui.ghostButton, ...(busy ? ui.buttonDisabled : {}) }}
        disabled={busy}
        onClick={preview}
      >
        {busy ? 'Working…' : 'Preview fill'}
      </button>

      {status.kind === 'not-fillable' && (
        <div style={{ ...ui.error, color: '#555', marginTop: '0.4rem' }}>
          Nothing to fill — the active tab is not a Workday application page.
        </div>
      )}

      {status.kind === 'planned' && (
        <div style={{ marginTop: '0.5rem' }}>
          {status.fields.length === 0 ? (
            <div style={{ ...ui.error, color: '#555' }}>
              No matching fields found on this page/step.
            </div>
          ) : (
            <>
              {status.fields.map((f) => (
                <div key={f.selector} style={ui.card}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{f.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#555' }}>
                    <span style={{ textDecoration: f.currentValue ? 'line-through' : 'none' }}>
                      {f.currentValue || '(empty)'}
                    </span>{' '}
                    → <strong>{f.value}</strong>
                  </div>
                </div>
              ))}
              <button style={ui.button} disabled={busy} onClick={() => fill(status.fields)}>
                Fill {status.fields.length} field{status.fields.length === 1 ? '' : 's'}
              </button>
              <div style={{ ...ui.label, marginTop: '0.3rem' }}>
                Review on the page after filling. The form is never submitted for you.
              </div>
            </>
          )}
        </div>
      )}

      {status.kind === 'filled' && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
          <div style={{ color: '#0a0' }}>Filled {status.result.filled} field(s).</div>
          {status.result.skipped > 0 && (
            <div style={{ color: '#b45309' }}>Skipped {status.result.skipped}.</div>
          )}
          {status.result.errors.map((e, i) => (
            <div key={i} style={ui.error}>{e}</div>
          ))}
        </div>
      )}
    </section>
  );
}
