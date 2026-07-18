import { describe, it, expect } from 'vitest';
import { SyncStorageAdapter } from '@/src/storage/sync-storage-adapter';
import { NotImplemented } from '@/src/core/errors';

describe('SyncStorageAdapter stub', () => {
  const adapter = new SyncStorageAdapter();

  it('load throws NotImplemented until Stage 3', () => {
    expect(() => adapter.load()).toThrow(NotImplemented);
  });

  it('save throws NotImplemented until Stage 3', () => {
    expect(() => adapter.save({} as never)).toThrow(NotImplemented);
  });
});
