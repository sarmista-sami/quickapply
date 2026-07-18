import type { ApplicantData, WorkItem, EduItem, Link } from '@/src/types/applicant-data';
import { TextField, ui } from './fields';

interface PreviewProps {
  data: ApplicantData;
  errors: Record<string, string>;
  onChange: (data: ApplicantData) => void;
}

export function Preview({ data, errors, onChange }: PreviewProps) {
  const patch = (partial: Partial<ApplicantData>) => onChange({ ...data, ...partial });
  const patchContact = (partial: Partial<ApplicantData['contact']>) =>
    patch({ contact: { ...data.contact, ...partial } });

  const updateAt = <T,>(list: T[], i: number, partial: Partial<T>): T[] =>
    list.map((item, idx) => (idx === i ? { ...item, ...partial } : item));
  const removeAt = <T,>(list: T[], i: number): T[] => list.filter((_, idx) => idx !== i);

  return (
    <div>
      <section style={ui.section}>
        <h2 style={ui.h2}>Contact</h2>
        <TextField label="First name" value={data.contact.firstName}
          error={errors['contact.firstName']} onChange={(v) => patchContact({ firstName: v })} />
        <TextField label="Last name" value={data.contact.lastName}
          error={errors['contact.lastName']} onChange={(v) => patchContact({ lastName: v })} />
        <TextField label="Email" value={data.contact.email}
          error={errors['contact.email']} onChange={(v) => patchContact({ email: v })} />
        <TextField label="Phone" value={data.contact.phone ?? ''}
          error={errors['contact.phone']} onChange={(v) => patchContact({ phone: v || undefined })} />
        <TextField label="Location" value={data.contact.location ?? ''}
          onChange={(v) => patchContact({ location: v || undefined })} />
      </section>

      <section style={ui.section}>
        <h2 style={ui.h2}>Work</h2>
        {data.work.map((w, i) => (
          <div key={i} style={ui.card}>
            <TextField label="Company" value={w.company} error={errors[`work.${i}.company`]}
              onChange={(v) => patch({ work: updateAt(data.work, i, { company: v }) })} />
            <TextField label="Title" value={w.title} error={errors[`work.${i}.title`]}
              onChange={(v) => patch({ work: updateAt(data.work, i, { title: v }) })} />
            <TextField label="Start" value={w.startDate} error={errors[`work.${i}.startDate`]}
              placeholder="YYYY-MM"
              onChange={(v) => patch({ work: updateAt(data.work, i, { startDate: v }) })} />
            <TextField label="End" value={w.endDate ?? ''} placeholder="YYYY-MM or blank"
              onChange={(v) => patch({ work: updateAt(data.work, i, { endDate: v || undefined }) })} />
            <label style={{ ...ui.label, display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              <input type="checkbox" checked={w.current}
                onChange={(e) => patch({ work: updateAt(data.work, i, { current: e.target.checked }) })} />
              Current role
            </label>
            <label style={ui.label}>Bullets (one per line)</label>
            <textarea style={{ ...ui.input, minHeight: '3rem' }} value={w.bullets.join('\n')}
              onChange={(e) =>
                patch({ work: updateAt(data.work, i, { bullets: splitLines(e.target.value) }) })} />
            <button style={{ ...ui.ghostButton, marginTop: '0.4rem' }}
              onClick={() => patch({ work: removeAt(data.work, i) })}>Remove</button>
          </div>
        ))}
        <button style={ui.ghostButton} onClick={() => patch({ work: [...data.work, emptyWork()] })}>
          + Add work
        </button>
      </section>

      <section style={ui.section}>
        <h2 style={ui.h2}>Education</h2>
        {data.education.map((ed, i) => (
          <div key={i} style={ui.card}>
            <TextField label="School" value={ed.school} error={errors[`education.${i}.school`]}
              onChange={(v) => patch({ education: updateAt(data.education, i, { school: v }) })} />
            <TextField label="Degree" value={ed.degree ?? ''}
              onChange={(v) => patch({ education: updateAt(data.education, i, { degree: v || undefined }) })} />
            <TextField label="Field" value={ed.field ?? ''}
              onChange={(v) => patch({ education: updateAt(data.education, i, { field: v || undefined }) })} />
            <button style={{ ...ui.ghostButton, marginTop: '0.4rem' }}
              onClick={() => patch({ education: removeAt(data.education, i) })}>Remove</button>
          </div>
        ))}
        <button style={ui.ghostButton}
          onClick={() => patch({ education: [...data.education, emptyEdu()] })}>+ Add education</button>
      </section>

      <section style={ui.section}>
        <h2 style={ui.h2}>Skills (comma-separated)</h2>
        <textarea style={{ ...ui.input, minHeight: '2.5rem' }} value={data.skills.join(', ')}
          onChange={(e) => patch({ skills: splitCommas(e.target.value) })} />
      </section>

      <section style={ui.section}>
        <h2 style={ui.h2}>Links</h2>
        {data.links.map((ln, i) => (
          <div key={i} style={ui.card}>
            <TextField label="Label" value={ln.label} error={errors[`links.${i}.label`]}
              onChange={(v) => patch({ links: updateAt(data.links, i, { label: v }) })} />
            <TextField label="URL" value={ln.url} error={errors[`links.${i}.url`]}
              onChange={(v) => patch({ links: updateAt(data.links, i, { url: v }) })} />
            <button style={{ ...ui.ghostButton, marginTop: '0.4rem' }}
              onClick={() => patch({ links: removeAt(data.links, i) })}>Remove</button>
          </div>
        ))}
        <button style={ui.ghostButton}
          onClick={() => patch({ links: [...data.links, emptyLink()] })}>+ Add link</button>
      </section>
    </div>
  );
}

function splitLines(v: string): string[] {
  return v.split(/\n/).map((s) => s.trim()).filter((s) => s.length > 0);
}
function splitCommas(v: string): string[] {
  return v.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
}
function emptyWork(): WorkItem {
  return { company: '', title: '', startDate: '', current: false, bullets: [] };
}
function emptyEdu(): EduItem {
  return { school: '' };
}
function emptyLink(): Link {
  return { label: '', url: '' };
}
