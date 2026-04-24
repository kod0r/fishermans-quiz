import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotes } from '@/store/notes';

describe('useNotes', () => {
  it('sollte mit leeren Notizen starten', () => {
    const { result } = renderHook(() => useNotes());
    expect(result.current.notes).toEqual({});
    expect(result.current.getNote('f1')).toBe('');
  });

  it('sollte eine Notiz speichern', () => {
    const { result } = renderHook(() => useNotes());
    act(() => {
      result.current.setNote('f1', 'Eselsbrücke: A ist immer richtig');
    });
    expect(result.current.getNote('f1')).toBe('Eselsbrücke: A ist immer richtig');
    expect(localStorage.getItem('fmq:notes:v1')).toContain('Eselsbrücke');
  });

  it('sollte eine Notiz aktualisieren', () => {
    const { result } = renderHook(() => useNotes());
    act(() => {
      result.current.setNote('f1', 'Erste Version');
    });
    act(() => {
      result.current.setNote('f1', 'Zweite Version');
    });
    expect(result.current.getNote('f1')).toBe('Zweite Version');
  });

  it('sollte eine Notiz löschen wenn leer', () => {
    const { result } = renderHook(() => useNotes());
    act(() => {
      result.current.setNote('f1', 'Wird gelöscht');
    });
    expect(result.current.getNote('f1')).toBe('Wird gelöscht');
    act(() => {
      result.current.setNote('f1', '   ');
    });
    expect(result.current.getNote('f1')).toBe('');
    expect(result.current.notes).not.toHaveProperty('f1');
  });

  it('sollte mehrere Notizen unabhängig verwalten', () => {
    const { result } = renderHook(() => useNotes());
    act(() => {
      result.current.setNote('f1', 'Notiz 1');
      result.current.setNote('f2', 'Notiz 2');
    });
    expect(result.current.getNote('f1')).toBe('Notiz 1');
    expect(result.current.getNote('f2')).toBe('Notiz 2');
  });

  it('sollte Notizen aus localStorage laden', () => {
    localStorage.setItem('fmq:notes:v1', JSON.stringify({ f1: 'Persistiert' }));
    const { result } = renderHook(() => useNotes());
    expect(result.current.getNote('f1')).toBe('Persistiert');
  });

  it('sollte Notizen zurücksetzen', () => {
    const { result } = renderHook(() => useNotes());
    act(() => {
      result.current.setNote('f1', 'Weg');
    });
    act(() => {
      result.current.resetNotes();
    });
    expect(result.current.notes).toEqual({});
    expect(result.current.getNote('f1')).toBe('');
  });

  it('sollte Notizen importieren', () => {
    const { result } = renderHook(() => useNotes());
    act(() => {
      result.current.importNotes({ f3: 'Importiert' });
    });
    expect(result.current.getNote('f3')).toBe('Importiert');
  });

  it('sollte Whitespace trimmen', () => {
    const { result } = renderHook(() => useNotes());
    act(() => {
      result.current.setNote('f1', '  Mit Leerzeichen  ');
    });
    expect(result.current.getNote('f1')).toBe('Mit Leerzeichen');
  });
});
