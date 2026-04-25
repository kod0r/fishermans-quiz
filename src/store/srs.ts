import { useState, useCallback, useEffect, useMemo } from 'react';
import type { SRSMeta, SelfAssessmentGrade } from '@/types/quiz';
import { SRSMetaSchema } from '@/utils/quizLoader';
import { SRSStorage } from '@/utils/storage';
import { sm2, calculateNextReview, DEFAULT_SRS_STATE, SELF_ASSESSMENT_QUALITY } from '@/utils/srs';

function bootstrapSRSMeta(): SRSMeta {
  return {
    ...DEFAULT_SRS_STATE,
    nextReview: new Date().toISOString(),
  };
}

export function useSRS() {
  const [srsMap, setSrsMap] = useState<Record<string, SRSMeta>>(() => {
    const loaded = SRSStorage.load();
    const result: Record<string, SRSMeta> = {};
    for (const [key, value] of Object.entries(loaded)) {
      const parsed = SRSMetaSchema.safeParse(value);
      if (parsed.success) {
        result[key] = parsed.data;
      } else {
        console.warn('[SRS] Invalid entry for', key, parsed.error.format());
      }
    }
    return result;
  });

  const persist = useCallback((next: Record<string, SRSMeta>) => {
    setSrsMap(next);
  }, []);

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
  }, []);

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
    persist({});
  }, [persist]);

  useEffect(() => {
    try {
      SRSStorage.save(srsMap);
    } catch {
      // Silently ignore storage errors
    }
  }, [srsMap]);

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
