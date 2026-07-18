import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageAdapter } from '@/src/storage/local-storage-adapter';
import type { ApplicantData } from '@/src/types/applicant-data';

// Minimal in-memory mock of chrome.storage.local.
const store: Record<string, unknown> = {};
beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  vi.stubGlobal('chrome', {
    storage: {
      local: {
        get: vi.fn(async (key: string) => (key in store ? { [key]: store[key] } : {})),
        set: vi.fn(async (items: Record<string, unknown>) => {
          Object.assign(store, items);
        }),
      },
    },
  });
});

const sample: ApplicantData = {
  contact: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' },
  work: [],
  education: [],
  skills: [],
  links: [],
  extra: {},
};

describe('LocalStorageAdapter', () => {
  const adapter = new LocalStorageAdapter();

  it('returns null when nothing is saved', async () => {
    expect(await adapter.load()).toBeNull();
  });

  it('round-trips saved data', async () => {
    await adapter.save(sample);
    expect(await adapter.load()).toEqual(sample);
  });
});
