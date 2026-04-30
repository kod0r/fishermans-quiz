import type { Frage, QuizRun, QuizData } from '@/types/quiz';

export function selectActiveQuestions(run: QuizRun, quizData: QuizData): Frage[] {
  return run.frageIds
    .map(id => {
      const f = quizData.fragen.find(q => q.id === id);
      if (!f) return undefined;
      const shuffle = run.answerShuffle?.[f.id];
      if (shuffle) {
        const keys: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
        const antworten = {
          A: f.antworten[shuffle[0]],
          B: f.antworten[shuffle[1]],
          C: f.antworten[shuffle[2]],
        };
        const richtige_antwort = keys[shuffle.indexOf(f.richtige_antwort)];
        return { ...f, antworten, richtige_antwort };
      }
      return f;
    })
    .filter((f): f is Frage => f !== undefined);
}

export interface RunStatistics {
  beantwortet: number;
  korrekt: number;
  falsch: number;
  gesamt: number;
}

export function selectStatistics(run: QuizRun, activeQuestions: Frage[]): RunStatistics {
  const beantwortet = Object.keys(run.antworten).length;
  const korrekt = activeQuestions.filter(f => run.antworten[f.id] === f.richtige_antwort).length;
  const falsch = activeQuestions.filter(f => f.id in run.antworten && run.antworten[f.id] !== f.richtige_antwort).length;
  const gesamt = activeQuestions.length;
  return { beantwortet, korrekt, falsch, gesamt };
}
