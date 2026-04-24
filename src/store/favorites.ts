import { useState, useCallback, useEffect } from 'react';
import { FavoritesStorage } from '@/utils/storage';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => FavoritesStorage.load());

  const toggleFavorite = useCallback((frageId: string) => {
    setFavorites(prev =>
      prev.includes(frageId)
        ? prev.filter(id => id !== frageId)
        : [...prev, frageId]
    );
  }, []);

  const isFavorite = useCallback((frageId: string) => {
    return favorites.includes(frageId);
  }, [favorites]);

  // Persistiere Favoriten bei Änderungen
  useEffect(() => {
    try {
      FavoritesStorage.save(favorites);
    } catch {
      // Silently ignore storage errors to avoid blocking UI updates
    }
  }, [favorites]);

  const resetFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    resetFavorites,
  };
}
