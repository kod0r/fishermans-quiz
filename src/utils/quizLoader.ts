import { z } from 'zod';
import type { Frage, QuizData } from '@/types/quiz';

// ── Zod Schemas für Runtime-Validierung ──
const FrageSchema = z.object({
  id: z.string().min(1),
  bereich: z.string().min(1),
  frage: z.string().min(1),
  antworten: z.object({
    A: z.string(),
    B: z.string(),
    C: z.string(),
  }),
  richtige_antwort: z.enum(['A', 'B', 'C']),
  bild: z.boolean().optional(),
  bild_url: z.string().optional(),
});

const QuizMetaSchema = z.object({
  meta: z.object({
    titel: z.string(),
    anzahl_fragen: z.number().int().nonnegative(),
    bereiche: z.record(z.string(), z.number().int().nonnegative()),
  }),
  bereiche: z.array(z.string()),
  fragenIndex: z.record(z.string(), z.string()),
});

const BereichDataSchema = z.object({
  bereich: z.string(),
  fragen: z.array(FrageSchema),
});

export type QuizMeta = z.infer<typeof QuizMetaSchema>;

const FrageMetaSchema = z.object({
  attempts: z.number().int().nonnegative(),
  correctStreak: z.number().int().nonnegative(),
  lastResult: z.enum(['correct', 'incorrect']).nullable(),
  firstSeen: z.string(),
  lastAttempt: z.string(),
});

const MetaStatsSchema = z.object({
  totalRuns: z.number().int().nonnegative(),
  totalQuestionsAnswered: z.number().int().nonnegative(),
  totalCorrect: z.number().int().nonnegative(),
  totalIncorrect: z.number().int().nonnegative(),
  bestStreak: z.number().int().nonnegative(),
  currentStreak: z.number().int().nonnegative(),
});

const BereichMetaSchema = z.object({
  passed: z.boolean(),
  consecutivePasses: z.number().int().nonnegative(),
  mastered: z.boolean(),
  lastAttempt: z.string().nullable(),
});

export const SRSMetaSchema = z.object({
  interval: z.number().nonnegative(),
  repetitions: z.number().int().nonnegative(),
  efactor: z.number().min(1.3),
  nextReview: z.string(),
});

export const MetaProgressionSchema = z.object({
  fragen: z.record(z.string(), FrageMetaSchema),
  stats: MetaStatsSchema,
  bereiche: z.record(z.string(), BereichMetaSchema).default({}),
});

export const AppSettingsSchema = z.object({
  gameMode: z.enum(['arcade', 'hardcore', 'exam']),
  backupReminderEnabled: z.boolean().optional(),
  lastBackupPrompt: z.string().optional(),
});

export const AppBackupSchema = z.object({
  version: z.literal('1'),
  exportedAt: z.string(),
  settings: AppSettingsSchema,
  metaArcade: MetaProgressionSchema,
  metaHardcore: MetaProgressionSchema,
  metaExam: MetaProgressionSchema.optional().default({ fragen: {}, stats: { totalRuns: 0, totalQuestionsAnswered: 0, totalCorrect: 0, totalIncorrect: 0, bestStreak: 0, currentStreak: 0 }, bereiche: {} }),
  favorites: z.array(z.string()),
  notes: z.record(z.string(), z.string()),
  history: z.array(z.object({
    id: z.string(),
    timestamp: z.string(),
    bereiche: z.array(z.string()),
    score: z.number(),
    total: z.number(),
    duration: z.number(),
    mode: z.enum(['arcade', 'hardcore', 'exam']),
  })),
  srs: z.record(z.string(), SRSMetaSchema).optional().default({}),
});

const BEREICH_FILENAME: Record<string, string> = {
  'Biologie': 'biologie.json',
  'Gewässerkunde': 'gewaesserkunde.json',
  'Gewässerpflege': 'gewaesserpflege.json',
  'Fanggeräte und -methoden': 'fanggeraete_und__methoden.json',
  'Recht': 'recht.json',
  'Bilderkennung': 'bilderkennung.json',
};

let metaCache: QuizMeta | null = null;
const fragenCache: Map<string, Frage[]> = new Map();

/**
 * Lädt die Metadaten (sehr klein: ~360 Bytes).
 * Enthält Bereichs-Übersicht ohne Fragen.
 */
export async function loadQuizMeta(): Promise<QuizMeta> {
  if (metaCache) return metaCache;

  const res = await fetch(`${import.meta.env.BASE_URL}data/quiz_meta.json`);
  if (!res.ok) throw new Error(`Meta laden fehlgeschlagen: ${res.status}`);

  const raw = await res.json();
  const parsed = QuizMetaSchema.safeParse(raw);
  if (!parsed.success) {
    console.error('[quizLoader] Meta-Validierung fehlgeschlagen:', parsed.error.format());
    throw new Error(`Meta-Format ungültig: ${parsed.error.message}`);
  }

  metaCache = parsed.data;
  return metaCache;
}

/**
 * Lädt Fragen für die angegebenen Bereiche.
 * Bereits geladene Bereiche werden aus dem Cache genommen.
 */
export async function loadBereichsFragen(bereiche: string[]): Promise<Frage[]> {
  const zuLaden = bereiche.filter(b => !fragenCache.has(b));

  if (zuLaden.length > 0) {
    const promises = zuLaden.map(async (bereich) => {
      const filename = BEREICH_FILENAME[bereich];
      if (!filename) throw new Error(`Unbekannter Bereich: ${bereich}`);

const res = await fetch(`${import.meta.env.BASE_URL}data/bereiche/${filename}`);
      if (!res.ok) throw new Error(`Bereich ${bereich} laden fehlgeschlagen: ${res.status}`);

      const raw = await res.json();
      const parsed = BereichDataSchema.safeParse(raw);
      if (!parsed.success) {
        console.error(`[quizLoader] Bereich ${bereich} Validierung fehlgeschlagen:`, parsed.error.format());
        throw new Error(`Bereich ${bereich} Format ungültig: ${parsed.error.message}`);
      }

      fragenCache.set(bereich, parsed.data.fragen);
      return parsed.data.fragen;
    });

    await Promise.all(promises);
  }

  return bereiche.flatMap(b => fragenCache.get(b) ?? []);
}

/**
 * Baut ein QuizData-Objekt aus geladenen Bereichen.
 */
export async function buildQuizData(bereiche: string[]): Promise<QuizData> {
  const meta = await loadQuizMeta();
  const fragen = await loadBereichsFragen(bereiche);

  return {
    meta: {
      ...meta.meta,
      anzahl_fragen: fragen.length,
      bereiche: Object.fromEntries(
        bereiche.map(b => [b, fragen.filter(f => f.bereich === b).length])
      ),
    },
    fragen,
  };
}

/**
 * Lädt ALLE Fragen (Fallback für Kompatibilität).
 * Nutzt intern die Bereichs-Dateien.
 */
export async function loadAllQuizData(): Promise<QuizData> {
  const meta = await loadQuizMeta();
  return buildQuizData(meta.bereiche);
}

/**
 * Cache leeren (z.B. für Tests).
 */
export function clearQuizCache(): void {
  metaCache = null;
  fragenCache.clear();
}
