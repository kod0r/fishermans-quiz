import type { Frage } from '@/types/quiz';

export function shuffleAnswers(frage: Frage): { shuffled: Frage; order: ('A' | 'B' | 'C')[] } {
  const entries: ['A' | 'B' | 'C', string][] = [
    ['A', frage.antworten.A],
    ['B', frage.antworten.B],
    ['C', frage.antworten.C],
  ];

  // Fisher-Yates
  for (let i = entries.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [entries[i], entries[j]] = [entries[j], entries[i]];
  }

  const keys: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
  const order = entries.map(e => e[0]);

  const antworten = {
    A: entries[0][1],
    B: entries[1][1],
    C: entries[2][1],
  } as Record<'A' | 'B' | 'C', string>;

  // Map original correct text to its new key
  const originalCorrectText = frage.antworten[frage.richtige_antwort];
  let richtige_antwort: 'A' | 'B' | 'C' = 'A';
  for (let i = 0; i < entries.length; i++) {
    if (entries[i][1] === originalCorrectText) {
      richtige_antwort = keys[i];
      break;
    }
  }

  return {
    shuffled: { ...frage, antworten, richtige_antwort },
    order,
  };
}
