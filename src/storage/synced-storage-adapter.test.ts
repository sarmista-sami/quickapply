import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SyncedStorageAdapter } from '@/src/storage/synced-storage-adapter';
import type { ApplicantData } from '@/src/types/applicant-data';

const local: Record<string, unknown> = {};
const sync: Record<string, unknown> = {};
let syncShouldReject = false;

function getFrom(store: Record<string, unknown>, keys: string | string[]) {
  const list = Array.isArray(keys) ? keys : [keys];
  const out: Record<string, unknown> = {};
  for (const k of list) if (k in store) out[k] = store[k];
  return out;
}

beforeEach(() => {
  for (const k of Object.keys(local)) delete local[k];
  for (const k of Object.keys(sync)) delete sync[k];
  syncShouldReject = false;
  vi.stubGlobal('chrome', {
    storage: {
      local: {
        get: vi.fn(async (key: string) => getFrom(local, key)),
        set: vi.fn(async (items: Record<string, unknown>) => Object.assign(local, items)),
        remove: vi.fn(async (keys: string | string[]) => {
          for (const k of Array.isArray(keys) ? keys : [keys]) delete local[k];
        }),
      },
      sync: {
        get: vi.fn(async (keys: string | string[]) => getFrom(sync, keys)),
        set: vi.fn(async (items: Record<string, unknown>) => {
          if (syncShouldReject) throw new Error('QUOTA_BYTES quota exceeded');
          Object.assign(sync, items);
        }),
        remove: vi.fn(async (keys: string | string[]) => {
          for (const k of Array.isArray(keys) ? keys : [keys]) delete sync[k];
        }),
      },
    },
  });
});

const full: ApplicantData = {
  contact: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' },
  work: [{ company: 'Analytical Engines', title: 'Mathematician', startDate: '1842', current: true, bullets: ['Wrote the first algorithm'] }],
  education: [{ school: 'University of London', degree: 'Mathematics' }],
  skills: ['algorithms'],
  links: [{ label: 'linkedin', url: 'https://linkedin.com/in/ada' }],
  extra: { referral: 'LinkedIn' },
};

describe('SyncedStorageAdapter.save', () => {
  it('mirrors the full model to local and chunks it to sync (incl. work/education)', async () => {
    await new SyncedStorageAdapter().save(full);
    expect(local.applicantData).toEqual(full);
    expect(sync.applicant_meta).toEqual({ count: 1 });
    const loaded = await new SyncedStorageAdapter().load();
    expect(loaded).toEqual(full); // work + education roam through sync
  });

  it('keeps local and warns when sync rejects (quota)', async () => {
    syncShouldReject = true;
    const onWarning = vi.fn();
    await new SyncedStorageAdapter({ onWarning }).save(full);
    expect(local.applicantData).toEqual(full);
    expect(sync.applicant_meta).toBeUndefined();
    expect(onWarning).toHaveBeenCalledOnce();
  });
});

describe('SyncedStorageAdapter chunking', () => {
  it('round-trips data larger than one chunk', async () => {
    const big: ApplicantData = {
      ...full,
      skills: Array.from({ length: 2000 }, (_, i) => `skill-${i}`),
    };
    await new SyncedStorageAdapter().save(big);
    expect((sync.applicant_meta as { count: number }).count).toBeGreaterThan(1);
    const loaded = await new SyncedStorageAdapter().load();
    expect(loaded).toEqual(big);
  });

  it('clears stale tail chunks when a later save is smaller', async () => {
    const big: ApplicantData = { ...full, skills: Array.from({ length: 2000 }, (_, i) => `skill-${i}`) };
    const adapter = new SyncedStorageAdapter();
    await adapter.save(big);
    const bigCount = (sync.applicant_meta as { count: number }).count;

    await adapter.save(full); // smaller
    expect((sync.applicant_meta as { count: number }).count).toBe(1);
    // No leftover chunk keys beyond the new count.
    for (let i = 1; i < bigCount; i++) expect(sync[`applicant_${i}`]).toBeUndefined();
    expect(await adapter.load()).toEqual(full);
  });
});

describe('SyncedStorageAdapter.load', () => {
  it('returns null when nothing is stored', async () => {
    expect(await new SyncedStorageAdapter().load()).toBeNull();
  });

  it('clear() empties sync + local so load returns null', async () => {
    const adapter = new SyncedStorageAdapter();
    await adapter.save(full);
    await adapter.clear();
    expect(Object.keys(sync)).toHaveLength(0);
    expect(Object.keys(local)).toHaveLength(0);
    expect(await adapter.load()).toBeNull();
  });

  it('prefers sync (full) over local', async () => {
    local.applicantData = { ...full, contact: { ...full.contact, email: 'stale@local' } };
    await new SyncedStorageAdapter().save(full); // overwrites sync with fresh full
    const loaded = await new SyncedStorageAdapter().load();
    expect(loaded?.contact.email).toBe('ada@example.com');
  });

  it('falls back to local when sync is empty (offline mirror)', async () => {
    local.applicantData = full;
    const loaded = await new SyncedStorageAdapter().load();
    expect(loaded).toEqual(full);
  });

  it('reconstructs full data on a new device (empty local, sync present)', async () => {
    await new SyncedStorageAdapter().save(full);
    delete local.applicantData; // simulate fresh install
    const loaded = await new SyncedStorageAdapter().load();
    expect(loaded).toEqual(full);
    expect(loaded?.work).toEqual(full.work);
    expect(loaded?.education).toEqual(full.education);
  });
});
