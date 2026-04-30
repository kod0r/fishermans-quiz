import { useCallback } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import type { PersistenceAdapter } from '@/utils/persistence';

const STORAGE_KEY = 'fmq:favorites:v1';

export function useFavorites(adapter?: PersistenceAdapter) {
  const [favorites, setFavorites] = usePersistentState<string[]>(STORAGE_KEY, [], adapter);

  const toggleFavorite = useCallback((frageId: string) => {
    setFavorites(prev =>
      prev.includes(frageId)
        ? prev.filter(id => id !== frageId)
        : [...prev, frageId]
    );
  }, [setFavorites]);

  const isFavorite = useCallback((frageId: string) => {
    return favorites.includes(frageId);
  }, [favorites]);

  const resetFavorites = useCallback(() => {
    setFavorites([]);
  }, [setFavorites]);

  const importFavorites = useCallback((data: string[]) => {
    setFavorites(data);
  }, [setFavorites]);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    resetFavorites,
    importFavorites,
  };
}
