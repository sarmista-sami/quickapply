import { useEffect, useState, type ChangeEvent } from 'react';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export function TextField({ label, value, onChange, error, placeholder }: TextFieldProps) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <input
        className={error ? 'input invalid' : 'input'}
        value={value}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
      {error && <div className="field-error">{error}</div>}
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
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <textarea
        className="input"
        style={{ minHeight, resize: 'vertical' }}
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
