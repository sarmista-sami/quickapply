import { describe, it, expect } from 'vitest';
import { parse } from '@/src/core/parser';
import { NotImplemented } from '@/src/core/errors';

describe('parser stub', () => {
  it('throws NotImplemented until Stage 2', () => {
    const file = new File(['x'], 'resume.docx');
    expect(() => parse(file)).toThrow(NotImplemented);
  });
});
