import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { vi } from 'vitest';
import { clearQuizCache } from '@/utils/quizLoader';

// localStorage Mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// fetch Mock
class FetchMock {
  private responses: Map<string, unknown> = new Map();

  setResponse(url: string, data: unknown) {
    this.responses.set(url, data);
  }

  getResponse(url: string): unknown | undefined {
    return this.responses.get(url);
  }

  clear() {
    this.responses.clear();
  }
}

export const fetchMock = new FetchMock();

global.fetch = vi.fn((url: string) => {
  const data = fetchMock.getResponse(url);
  if (data) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
    } as Response);
  }
  return Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({}),
  } as Response);
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
  fetchMock.clear();
  clearQuizCache();
});
