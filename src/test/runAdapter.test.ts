import { describe, it, expect } from 'vitest';
import { createRunAdapter } from '@/utils/persistence/runAdapter';
import { memoryAdapter } from '@/utils/persistence/memoryAdapter';
import type { QuizRun } from '@/types/quiz';

describe('createRunAdapter', () => {
  beforeEach(() => {
    memoryAdapter.clear('test:arcade');
    memoryAdapter.clear('test:hardcore');
  });

  it('saves and loads a valid run', () => {
    const adapter = createRunAdapter(memoryAdapter);
    const run: QuizRun = {
      frageIds: ['1'],
      antworten: {},
      topics: ['Biologie'],
      aktuellerIndex: 0,
      isActive: true,
      gameMode: 'arcade',
    };

    adapter.save('test:arcade', run);
    expect(memoryAdapter.load('test:arcade')).toEqual(run);
  });

  it('passes through null', () => {
    const adapter = createRunAdapter(memoryAdapter);
    adapter.save('test:arcade', null);
    expect(memoryAdapter.load('test:arcade')).toBeNull();
  });

  it('delegates clear to base adapter', () => {
    const adapter = createRunAdapter(memoryAdapter);
    memoryAdapter.save('test:arcade', { foo: 'bar' });
    adapter.clear('test:arcade');
    expect(memoryAdapter.load('test:arcade')).toBeNull();
  });

  it('returns null for invalid stored data', () => {
    const adapter = createRunAdapter(memoryAdapter);
    memoryAdapter.save('test:arcade', { notAQuizRun: true });
    expect(adapter.load('test:arcade')).toBeNull();
  });
});
