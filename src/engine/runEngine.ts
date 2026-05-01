import type { Frage, QuizRun, QuizData, SessionType, SelfAssessmentGrade, GameMode } from '@/types/quiz';
import { shuffleAnswers as computeShuffle } from '@/utils/quizShuffle';

export interface CreateRunOptions {
  limit?: number;
  durationSeconds?: number;
  sessionType?: SessionType;
  enableShuffle?: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildAnswerShuffle(fragen: Frage[]): Record<string, ('A' | 'B' | 'C')[]> {
  const map: Record<string, ('A' | 'B' | 'C')[]> = {};
  for (const f of fragen) {
    const { order } = computeShuffle(f);
    map[f.id] = order;
  }
  return map;
}

export function createRun(quizData: QuizData, topics: string[], gameMode: GameMode, options?: CreateRunOptions): QuizRun {
  const { limit, durationSeconds, sessionType, enableShuffle } = options ?? {};
  const gefiltert = quizData.fragen.filter(f => topics.includes(f.topic));
  const gemischt = shuffleArray(gefiltert);
  const finalPool = limit && limit > 0 ? gemischt.slice(0, limit) : gemischt;

  let answerShuffle: Record<string, ('A' | 'B' | 'C')[]> | undefined;
  if (enableShuffle) {
    answerShuffle = buildAnswerShuffle(finalPool);
  }

  return {
    frageIds: finalPool.map(f => f.id),
    antworten: {},
    topics,
    aktuellerIndex: 0,
    isActive: true,
    startedAt: new Date().toISOString(),
    durationSeconds,
    sessionType: sessionType ?? 'quiz',
    answerShuffle,
    gameMode,
  };
}

export function extendRun(
  run: QuizRun,
  quizData: QuizData,
  topics: string[],
  enableShuffle?: boolean,
): QuizRun | null {
  if (run.durationSeconds) return null;

  const combinedTopics = [...new Set([...run.topics, ...topics])];
  const existingIds = new Set(run.frageIds);
  const neueFragen = quizData.fragen.filter(f => topics.includes(f.topic) && !existingIds.has(f.id));
  if (neueFragen.length === 0) return null;

  const gemischt = shuffleArray(neueFragen);
  const newAnswerShuffle = run.answerShuffle ? { ...run.answerShuffle } : undefined;
  if (newAnswerShuffle && enableShuffle) {
    for (const f of gemischt) {
      const { order } = computeShuffle(f);
      newAnswerShuffle[f.id] = order;
    }
  }

  return {
    ...run,
    frageIds: [...run.frageIds, ...gemischt.map(f => f.id)],
    topics: combinedTopics,
    startedAt: new Date().toISOString(),
    completedAt: undefined,
    answerShuffle: newAnswerShuffle,
  };
}

export function answerQuestion(run: QuizRun, frageId: string, antwort: string): QuizRun {
  if (frageId in run.antworten) return run;
  return { ...run, antworten: { ...run.antworten, [frageId]: antwort } };
}

export function selfAssess(run: QuizRun, frageId: string, grade: SelfAssessmentGrade): QuizRun {
  return {
    ...run,
    selfAssessments: { ...(run.selfAssessments ?? {}), [frageId]: grade },
  };
}

export function nextQuestion(run: QuizRun): QuizRun {
  if (run.aktuellerIndex >= run.frageIds.length - 1) return run;
  return { ...run, aktuellerIndex: run.aktuellerIndex + 1 };
}

export function prevQuestion(run: QuizRun): QuizRun {
  if (run.aktuellerIndex <= 0) return run;
  return { ...run, aktuellerIndex: run.aktuellerIndex - 1 };
}

export function jumpToQuestion(run: QuizRun, index: number): QuizRun {
  if (index < 0 || index >= run.frageIds.length) return run;
  return { ...run, aktuellerIndex: index };
}

export function removeTopicFromRun(run: QuizRun, quizData: QuizData, topicId: string): QuizRun | null {
  const idsToRemove = new Set(quizData.fragen.filter(f => f.topic === topicId).map(f => f.id));
  const neueFrageIds = run.frageIds.filter(id => !idsToRemove.has(id));
  const newTopics = run.topics.filter(b => b !== topicId);

  if (neueFrageIds.length === run.frageIds.length && newTopics.length === run.topics.length) {
    return run;
  }

  if (neueFrageIds.length === 0) {
    return null;
  }

  const neueAntworten: Record<string, string> = {};
  for (const id of neueFrageIds) {
    if (run.antworten[id] !== undefined) {
      neueAntworten[id] = run.antworten[id];
    }
  }

  const removedBeforeIndex = run.frageIds
    .slice(0, run.aktuellerIndex)
    .filter(id => idsToRemove.has(id)).length;

  const neuerIndex = Math.max(0, run.aktuellerIndex - removedBeforeIndex);
  const finalIndex = Math.min(neuerIndex, neueFrageIds.length - 1);

  let neueAnswerShuffle = run.answerShuffle ? { ...run.answerShuffle } : undefined;
  if (neueAnswerShuffle) {
    for (const id of Array.from(idsToRemove)) {
      delete neueAnswerShuffle[id];
    }
    if (Object.keys(neueAnswerShuffle).length === 0) {
      neueAnswerShuffle = undefined;
    }
  }

  const neueSelfAssessments = run.selfAssessments ? { ...run.selfAssessments } : undefined;
  if (neueSelfAssessments) {
    for (const id of Array.from(idsToRemove)) {
      delete neueSelfAssessments[id];
    }
    if (Object.keys(neueSelfAssessments).length === 0) {
      /* keep empty object explicitly to avoid undefined vs {} drift elsewhere */
    }
  }

  return {
    ...run,
    frageIds: neueFrageIds,
    antworten: neueAntworten,
    topics: newTopics,
    aktuellerIndex: finalIndex,
    answerShuffle: neueAnswerShuffle,
    selfAssessments: neueSelfAssessments,
  };
}

export function restartRun(run: QuizRun, quizData: QuizData): QuizRun {
  const gemischt = shuffleArray(run.frageIds);

  let newAnswerShuffle: Record<string, ('A' | 'B' | 'C')[]> | undefined;
  if (run.answerShuffle) {
    newAnswerShuffle = {};
    for (const id of gemischt) {
      const f = quizData.fragen.find(q => q.id === id);
      if (f) {
        const { order } = computeShuffle(f);
        newAnswerShuffle[id] = order;
      }
    }
  }

  return {
    ...run,
    frageIds: gemischt,
    antworten: {},
    aktuellerIndex: 0,
    startedAt: new Date().toISOString(),
    selfAssessments: {},
    completedAt: undefined,
    answerShuffle: newAnswerShuffle,
  };
}

export function interruptRun(run: QuizRun): QuizRun {
  return { ...run, isActive: false };
}

export function completeRun(run: QuizRun): QuizRun {
  return { ...run, completedAt: new Date().toISOString() };
}

export function isRunExpired(run: QuizRun): boolean {
  if (!run.startedAt || !run.durationSeconds) return false;
  const elapsed = (Date.now() - new Date(run.startedAt).getTime()) / 1000;
  return elapsed >= run.durationSeconds;
}

export function detectInconsistency(run: QuizRun, quizData: QuizData): string[] {
  const vorhandeneIds = new Set(quizData.fragen.map(f => f.id));
  return run.frageIds.filter(id => !vorhandeneIds.has(id));
}

export function purgeMissingQuestions(run: QuizRun, quizData: QuizData): QuizRun | null {
  const vorhandeneIds = new Set(quizData.fragen.map(f => f.id));
  const fehlendeIds = run.frageIds.filter(id => !vorhandeneIds.has(id));
  if (fehlendeIds.length === 0) return run;

  const bereinigteIds = run.frageIds.filter(id => vorhandeneIds.has(id));
  if (bereinigteIds.length === 0) return null;

  const bereinigteAntworten: Record<string, string> = {};
  for (const id of bereinigteIds) {
    if (run.antworten[id] !== undefined) {
      bereinigteAntworten[id] = run.antworten[id];
    }
  }

  let bereinigteAnswerShuffle = run.answerShuffle ? { ...run.answerShuffle } : undefined;
  if (bereinigteAnswerShuffle) {
    for (const id of fehlendeIds) {
      delete bereinigteAnswerShuffle[id];
    }
    if (Object.keys(bereinigteAnswerShuffle).length === 0) {
      bereinigteAnswerShuffle = undefined;
    }
  }

  const bereinigteSelfAssessments = run.selfAssessments ? { ...run.selfAssessments } : undefined;
  if (bereinigteSelfAssessments) {
    for (const id of fehlendeIds) {
      delete bereinigteSelfAssessments[id];
    }
  }

  const bereinigterIndex = Math.min(run.aktuellerIndex, bereinigteIds.length - 1);
  return {
    ...run,
    frageIds: bereinigteIds,
    antworten: bereinigteAntworten,
    aktuellerIndex: bereinigterIndex,
    answerShuffle: bereinigteAnswerShuffle,
    selfAssessments: bereinigteSelfAssessments,
  };
}
