import type { Frage, FrageMeta, SRSMeta } from '@/types/quiz';
import { isMastered } from '@/utils/srs';

export interface FilterOptions {
  query?: string;
  bereiche?: string[];
  hasImage?: boolean;
  onlyFavorites?: boolean;
  masteryFilter?: 'all' | 'mastered' | 'unmastered';
}

export function filterFragen(
  fragen: Frage[],
  options: FilterOptions,
  context: {
    favorites: string[];
    metaProgress: Record<string, FrageMeta>;
    srsMap: Record<string, SRSMeta>;
  }
): Frage[] {
  const { query, bereiche, hasImage, onlyFavorites, masteryFilter } = options;
  const { favorites, metaProgress, srsMap } = context;
  const queryLower = query?.trim().toLowerCase();

  return fragen.filter((frage) => {
    if (queryLower && !frage.frage.toLowerCase().includes(queryLower)) return false;
    if (bereiche?.length && !bereiche.includes(frage.bereich)) return false;
    if (hasImage && !frage.bild) return false;
    if (onlyFavorites && !favorites.includes(frage.id)) return false;
    if (masteryFilter && masteryFilter !== 'all') {
      const fm = metaProgress[frage.id];
      const mastered = fm ? isMastered(fm, srsMap[frage.id]) : false;
      if (masteryFilter === 'mastered' && !mastered) return false;
      if (masteryFilter === 'unmastered' && mastered) return false;
    }
    return true;
  });
}
