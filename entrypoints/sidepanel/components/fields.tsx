import { useEffect, useState, type ChangeEvent } from 'react';

export const ui = {
  page: { fontFamily: 'system-ui, sans-serif', padding: '1rem', color: '#1a1a1a' },
  h1: { fontSize: '1.1rem', margin: '0 0 0.75rem' },
  section: { margin: '0 0 1rem' },
  h2: { fontSize: '0.85rem', textTransform: 'uppercase', color: '#666', margin: '0 0 0.4rem' },
  label: { display: 'block', fontSize: '0.75rem', color: '#555', marginBottom: '0.1rem' },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.35rem 0.5rem',
    fontSize: '0.85rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  inputError: { borderColor: '#d33' },
  error: { color: '#d33', fontSize: '0.7rem', marginTop: '0.1rem' },
  button: {
    padding: '0.45rem 0.9rem',
    fontSize: '0.85rem',
    border: 'none',
    borderRadius: '4px',
    background: '#2563eb',
    color: '#fff',
    cursor: 'pointer',
  },
  buttonDisabled: { background: '#9db4e8', cursor: 'not-allowed' },
  ghostButton: {
    padding: '0.3rem 0.6rem',
    fontSize: '0.75rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    background: '#fff',
    cursor: 'pointer',
  },
  card: { border: '1px solid #e5e5e5', borderRadius: '6px', padding: '0.6rem', marginBottom: '0.5rem' },
} as const;

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export function TextField({ label, value, onChange, error, placeholder }: TextFieldProps) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <label style={ui.label}>{label}</label>
      <input
        style={{ ...ui.input, ...(error ? ui.inputError : {}) }}
        value={value}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
      {error && <div style={ui.error}>{error}</div>}
    </div>
  );
}

interface ListTextAreaProps {
  label?: string;
  values: string[];
  separator: 'comma' | 'lines';
  onChange: (values: string[]) => void;
  minHeight?: string;
}

/**
 * Textarea for a list value (skills, bullets). Keeps a local draft while typing —
 * splitting/normalizing only on blur — so typed commas/newlines aren't eaten mid-edit
 * by the controlled round-trip.
 */
export function ListTextArea({ label, values, separator, onChange, minHeight = '2.5rem' }: ListTextAreaProps) {
  const joined = separator === 'comma' ? values.join(', ') : values.join('\n');
  const [draft, setDraft] = useState(joined);
  const [editing, setEditing] = useState(false);

  // Re-sync when the upstream value changes while not actively editing (e.g. new parse).
  useEffect(() => {
    if (!editing) setDraft(joined);
  }, [joined]); // editing intentionally omitted: blur commits, focus shouldn't reset

  function commit(text: string) {
    const parts =
      separator === 'comma'
        ? text.split(',').map((s) => s.trim())
        : text.split(/\n/).map((s) => s.trim());
    onChange(parts.filter((s) => s.length > 0));
  }

  return (
    <div style={{ marginBottom: '0.5rem' }}>
      {label && <label style={ui.label}>{label}</label>}
      <textarea
        style={{ ...ui.input, minHeight }}
        value={draft}
        onFocus={() => setEditing(true)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => {
          setEditing(false);
          commit(e.target.value);
        }}
      />
    </div>
  );
}
