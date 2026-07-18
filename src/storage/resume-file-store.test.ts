import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResumeFileStore, storedToFile } from '@/src/storage/resume-file-store';

const local: Record<string, unknown> = {};
beforeEach(() => {
  for (const k of Object.keys(local)) delete local[k];
  vi.stubGlobal('chrome', {
    storage: {
      local: {
        get: vi.fn(async (key: string) => (key in local ? { [key]: local[key] } : {})),
        set: vi.fn(async (items: Record<string, unknown>) => Object.assign(local, items)),
      },
    },
  });
});

describe('ResumeFileStore', () => {
  const store = new ResumeFileStore();

  it('returns null when nothing stored', async () => {
    expect(await store.load()).toBeNull();
  });

  it('round-trips name, type, and bytes', async () => {
    const original = new File([new Uint8Array([1, 2, 3, 4, 250])], 'resume.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    await store.save(original);

    const stored = await store.loadStored();
    expect(stored?.name).toBe('resume.docx');
    expect(stored?.type).toContain('wordprocessingml');

    const restored = await store.load();
    expect(restored?.name).toBe('resume.docx');
    const bytes = new Uint8Array(await restored!.arrayBuffer());
    expect(Array.from(bytes)).toEqual([1, 2, 3, 4, 250]);
  });

  it('storedToFile reconstructs from a stored record', () => {
    const file = storedToFile({ name: 'r.docx', type: 'text/plain', dataBase64: btoa('hi') });
    expect(file.name).toBe('r.docx');
  });
});
