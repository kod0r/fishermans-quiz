import { useState, useCallback, useEffect } from 'react';
import { NotesStorage } from '@/utils/storage';

export function useNotes() {
  const [notes, setNotes] = useState<Record<string, string>>(() => NotesStorage.load());

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
  }, []);

  const getNote = useCallback((frageId: string) => {
    return notes[frageId] ?? '';
  }, [notes]);

  // Persistiere Notizen bei Änderungen
  useEffect(() => {
    try {
      NotesStorage.save(notes);
    } catch {
      // Silently ignore storage errors to avoid blocking UI updates
    }
  }, [notes]);

  const resetNotes = useCallback(() => {
    setNotes({});
  }, []);

  const importNotes = useCallback((data: Record<string, string>) => {
    setNotes(data);
  }, []);

  return {
    notes,
    setNote,
    getNote,
    resetNotes,
    importNotes,
  };
}
