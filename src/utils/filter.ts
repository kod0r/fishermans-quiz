import type { Frage, FrageMeta, SRSMeta, QuizData } from '@/types/quiz';
import { isMastered } from '@/utils/srs';

export interface FilterOptions {
  query?: string;
  topics?: string[];
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
  const { query, topics, hasImage, onlyFavorites, masteryFilter } = options;
  const { favorites, metaProgress, srsMap } = context;
  const queryLower = query?.trim().toLowerCase();

  return fragen.filter((frage) => {
    if (queryLower && !frage.frage.toLowerCase().includes(queryLower)) return false;
    if (topics?.length && !topics.includes(frage.topic)) return false;
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


export function filterQuizDataByFavorites(
  data: QuizData,
  favorites: string[]
): QuizData | null {
  const favIds = new Set(favorites);
  const fragen = data.fragen.filter(f => favIds.has(f.id));
  if (fragen.length === 0) return null;
  return { ...data, fragen };
}

export function filterQuizDataByWeakness(
  data: QuizData,
  metaFragen: Record<string, FrageMeta>
): QuizData | null {
  const weakFragen = data.fragen
    .filter(f => {
      const fm = metaFragen[f.id];
      if (!fm || fm.attempts === 0) return false;
      return fm.correctStreak < fm.attempts * 0.5;
    })
    .sort((a, b) => {
      const ma = metaFragen[a.id];
      const mb = metaFragen[b.id];
      const scoreA = (ma?.attempts ?? 0) - (ma?.correctStreak ?? 0);
      const scoreB = (mb?.attempts ?? 0) - (mb?.correctStreak ?? 0);
      return scoreB - scoreA;
    });
  if (weakFragen.length === 0) return null;
  return { ...data, fragen: weakFragen };
}

export function filterQuizDataBySRSDue(
  data: QuizData,
  dueFrageIds: string[]
): QuizData | null {
  const dueIds = new Set(dueFrageIds);
  const dueFragen = data.fragen.filter(f => dueIds.has(f.id));
  if (dueFragen.length === 0) return null;
  return { ...data, fragen: dueFragen };
}
