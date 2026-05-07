import { describe, it, expect, vi, beforeEach } from 'vitest';
import { localStorageAdapter } from '@/utils/persistence/localStorageAdapter';
import { memoryAdapter } from '@/utils/persistence/memoryAdapter';

describe('localStorageAdapter edge cases', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns null when stored data is invalid JSON', () => {
    localStorage.setItem('bad-json', 'not json {{{');
    const result = localStorageAdapter.load('bad-json');
    expect(result).toBeNull();
  });

  it('logs warning and does not throw on QuotaExceededError', () => {
    const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw quotaError;
    });

    expect(() => localStorageAdapter.save('key', { data: 'x' })).not.toThrow();
    expect(console.warn).toHaveBeenCalledWith(
      '[localStorageAdapter] Quota exceeded, write dropped'
    );
  });

  it('throws on non-quota localStorage errors', () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('localStorage is disabled');
    });

    expect(() => localStorageAdapter.save('key', { data: 'x' })).toThrow(
      'localStorage is disabled'
    );
  });

  it('returns null for missing keys', () => {
    const result = localStorageAdapter.load('never-saved');
    expect(result).toBeNull();
  });
});

describe('memoryAdapter edge cases', () => {
  beforeEach(() => {
    memoryAdapter.clear('test-key');
  });

  it('returns null for keys that were never saved', () => {
    const result = memoryAdapter.load('never-saved');
    expect(result).toBeNull();
  });

  it('returns null after clear', () => {
    memoryAdapter.save('test-key', { value: 42 });
    memoryAdapter.clear('test-key');
    const result = memoryAdapter.load('test-key');
    expect(result).toBeNull();
  });
});
