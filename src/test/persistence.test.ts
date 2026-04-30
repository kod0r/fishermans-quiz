import { describe, it, expect, beforeEach } from 'vitest';
import { memoryAdapter } from '@/utils/persistence/memoryAdapter';
import { localStorageAdapter } from '@/utils/persistence/localStorageAdapter';

describe('memoryAdapter', () => {
  beforeEach(() => {
    memoryAdapter.clear('test-key');
  });

  it('returns default when key absent', () => {
    const value = memoryAdapter.load('test-key');
    expect(value).toBeNull();
  });

  it('round-trips data', () => {
    memoryAdapter.save('test-key', { foo: 'bar' });
    const value = memoryAdapter.load('test-key');
    expect(value).toEqual({ foo: 'bar' });
  });

  it('clears data', () => {
    memoryAdapter.save('test-key', 42);
    memoryAdapter.clear('test-key');
    const value = memoryAdapter.load('test-key');
    expect(value).toBeNull();
  });
});

describe('localStorageAdapter', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves JSON to localStorage', () => {
    localStorageAdapter.save('ls-key', { num: 1 });
    expect(localStorage.getItem('ls-key')).toBe('{"num":1}');
  });

  it('loads parsed JSON from localStorage', () => {
    localStorage.setItem('ls-key', '{"num":1}');
    const value = localStorageAdapter.load('ls-key');
    expect(value).toEqual({ num: 1 });
  });

  it('returns null when key absent', () => {
    const value = localStorageAdapter.load('missing');
    expect(value).toBeNull();
  });

  it('clears key from localStorage', () => {
    localStorage.setItem('ls-key', 'x');
    localStorageAdapter.clear('ls-key');
    expect(localStorage.getItem('ls-key')).toBeNull();
  });
});
