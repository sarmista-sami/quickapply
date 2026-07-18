import { describe, it, expect } from 'vitest';
import { normalize } from '@/src/core/normalizer';
import { NotImplemented } from '@/src/core/errors';
import type { RawResume } from '@/src/types/raw-resume';

describe('normalizer stub', () => {
  it('throws NotImplemented until Stage 2', () => {
    const raw: RawResume = { sourceName: 'resume.docx', format: 'docx', blocks: [] };
    expect(() => normalize(raw)).toThrow(NotImplemented);
  });
});
