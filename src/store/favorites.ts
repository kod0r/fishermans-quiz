import { useState, useCallback } from 'react';
import { FavoritesStorage } from '@/utils/storage';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => FavoritesStorage.load());

  const toggleFavorite = useCallback((frageId: string) => {
    setFavorites(prev => {
      const next = prev.includes(frageId)
        ? prev.filter(id => id !== frageId)
        : [...prev, frageId];
      FavoritesStorage.save(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((frageId: string) => {
    return favorites.includes(frageId);
  }, [favorites]);

  const resetFavorites = useCallback(() => {
    FavoritesStorage.clear();
    setFavorites([]);
  }, []);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    resetFavorites,
  };
}
