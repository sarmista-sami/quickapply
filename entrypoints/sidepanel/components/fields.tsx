import type { ChangeEvent } from 'react';

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
