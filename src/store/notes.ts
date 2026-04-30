import { useCallback } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { createNotesAdapter } from '@/utils/persistence/notesAdapter';
import type { PersistenceAdapter } from '@/utils/persistence';

const STORAGE_KEY = 'fmq:notes:v1';
const defaultAdapter = createNotesAdapter();

export function useNotes(adapter: PersistenceAdapter<Record<string, string>> = defaultAdapter) {
  const [notes, setNotes] = usePersistentState<Record<string, string>>(STORAGE_KEY, {}, adapter);

  const setNote = useCallback((frageId: string, text: string) => {
    setNotes(prev => {
      if (!text.trim()) {
        const rest: Record<string, string> = {};
        for (const [key, value] of Object.entries(prev)) {
          if (key !== frageId) rest[key] = value;
        }
        return rest;
      }
      return { ...prev, [frageId]: text.trim() };
    });
  }, [setNotes]);

  const getNote = useCallback((frageId: string) => {
    return notes[frageId] ?? '';
  }, [notes]);

  const resetNotes = useCallback(() => {
    setNotes({});
  }, [setNotes]);

  const importNotes = useCallback((data: Record<string, string>) => {
    setNotes(data);
  }, [setNotes]);

  return {
    notes,
    setNote,
    getNote,
    resetNotes,
    importNotes,
  };
}
