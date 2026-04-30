import { useCallback, useMemo } from 'react';
import type { SRSMeta, SelfAssessmentGrade } from '@/types/quiz';
import { usePersistentState } from '@/hooks/usePersistentState';
import { createSRSAdapter } from '@/utils/persistence/srsAdapter';
import type { PersistenceAdapter } from '@/utils/persistence';
import { sm2, calculateNextReview, DEFAULT_SRS_STATE, SELF_ASSESSMENT_QUALITY } from '@/utils/srs';

const STORAGE_KEY = 'fmq:meta:srs:v1';
const defaultAdapter = createSRSAdapter();

function bootstrapSRSMeta(): SRSMeta {
  return {
    ...DEFAULT_SRS_STATE,
    nextReview: new Date().toISOString(),
  };
}

export function useSRS(adapter: PersistenceAdapter<Record<string, SRSMeta>> = defaultAdapter) {
  const [srsMap, setSrsMap] = usePersistentState<Record<string, SRSMeta>>(
    STORAGE_KEY,
    {},
    adapter,
  );

  const recordAnswer = useCallback((frageId: string, quality: number) => {
    setSrsMap(prev => {
      const existing = prev[frageId] ?? bootstrapSRSMeta();
      const nextState = sm2(quality, existing);
      const nextMeta: SRSMeta = {
        ...nextState,
        nextReview: calculateNextReview(nextState.interval),
      };
      return { ...prev, [frageId]: nextMeta };
    });
  }, [setSrsMap]);

  const recordSelfAssessment = useCallback((frageId: string, grade: SelfAssessmentGrade) => {
    const quality = SELF_ASSESSMENT_QUALITY[grade] ?? 0;
    recordAnswer(frageId, quality);
  }, [recordAnswer]);

  const getSRSMeta = useCallback((frageId: string): SRSMeta | undefined => {
    return srsMap[frageId];
  }, [srsMap]);

  const dueCount = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Object.values(srsMap).filter(m => {
      const review = new Date(m.nextReview);
      review.setHours(0, 0, 0, 0);
      return review <= now;
    }).length;
  }, [srsMap]);

  const dueFrageIds = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Object.entries(srsMap)
      .filter(([, m]) => {
        const review = new Date(m.nextReview);
        review.setHours(0, 0, 0, 0);
        return review <= now;
      })
      .map(([id]) => id);
  }, [srsMap]);

  const reset = useCallback(() => {
    setSrsMap({});
  }, [setSrsMap]);

  return {
    srsMap,
    dueCount,
    dueFrageIds,
    recordAnswer,
    recordSelfAssessment,
    getSRSMeta,
    reset,
  };
}
