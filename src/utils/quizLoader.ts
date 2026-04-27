import { z } from 'zod';
import type { Frage, QuizData } from '@/types/quiz';

// ── Zod Schemas für Runtime-Validierung ──
const FrageSchema = z.object({
  id: z.string().min(1),
  topic: z.string().min(1),
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
    topics: z.record(z.string(), z.number().int().nonnegative()),
  }),
  topics: z.array(z.string()),
  topicFiles: z.record(z.string(), z.string()),  // Topic name → filename
  fragenIndex: z.record(z.string(), z.string()),
});

const TopicDataSchema = z.object({
  topic: z.string(),
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
  arcadeRunsCompleted: z.number().int().nonnegative().optional(),
});

const TopicMetaSchema = z.object({
  passed: z.boolean(),
  consecutivePasses: z.number().int().nonnegative(),
  mastered: z.boolean(),
  lastAttempt: z.string().nullable(),
});

const ExamMetaSchema = z.object({
  attempts: z.number().int().nonnegative(),
  passedCount: z.number().int().nonnegative(),
  bestScore: z.number().int().nonnegative(),
  lastScore: z.number().int().nonnegative(),
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
  topics: z.record(z.string(), TopicMetaSchema).default({}),
  arcadeStars: z.record(z.string(), z.union([z.literal(1), z.literal(2), z.literal(3)])).optional().default({}),
  bestArcadeScore: z.record(z.string(), z.number().nonnegative()).optional().default({}),
  examMeta: ExamMetaSchema.optional(),
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
  metaExam: MetaProgressionSchema.optional().default({ fragen: {}, stats: { totalRuns: 0, totalQuestionsAnswered: 0, totalCorrect: 0, totalIncorrect: 0, bestStreak: 0, currentStreak: 0, arcadeRunsCompleted: 0 }, topics: {}, arcadeStars: {}, bestArcadeScore: {} }),
  topicFiles: z.record(z.string(), z.string()),  // Topic name → filename
  favorites: z.array(z.string()),
  notes: z.record(z.string(), z.string()),
  history: z.array(z.object({
    id: z.string(),
    timestamp: z.string(),
    topics: z.array(z.string()).optional().default([]),
    bereiche: z.array(z.string()).optional(),
    score: z.number(),
    total: z.number(),
    duration: z.number(),
    mode: z.enum(['arcade', 'hardcore', 'exam']),
  }).transform((e) => ({
    id: e.id,
    timestamp: e.timestamp,
    topics: e.topics.length > 0 ? e.topics : e.bereiche ?? [],
    score: e.score,
    total: e.total,
    duration: e.duration,
    mode: e.mode,
  }))),
  srs: z.record(z.string(), SRSMetaSchema).optional().default({}),
});

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
 * Lädt Fragen für die angegebenen Topics.
 * Bereits geladene Topics werden aus dem Cache genommen.
 */
export async function loadTopicQuestions(topics: string[]): Promise<Frage[]> {
  const zuLaden = topics.filter(b => !fragenCache.has(b));

  if (zuLaden.length > 0) {
    const meta = await loadQuizMeta();
    const promises = zuLaden.map(async (topic) => {
      const filename = meta.topicFiles[topic];
      if (!filename) throw new Error(`Unbekanntes Thema: ${topic}. Kein Dateiname in den Metadaten gefunden.`);

      const res = await fetch(`${import.meta.env.BASE_URL}data/topics/${filename}`);
      if (!res.ok) throw new Error(`Thema ${topic} laden fehlgeschlagen: ${res.status}`);

      const raw = await res.json();
      const parsed = TopicDataSchema.safeParse(raw);
      if (!parsed.success) {
        console.error(`[quizLoader] Thema ${topic} Validierung fehlgeschlagen:`, parsed.error.format());
        throw new Error(`Thema ${topic} Format ungültig: ${parsed.error.message}`);
      }

      fragenCache.set(topic, parsed.data.fragen);
      return parsed.data.fragen;
    });

    await Promise.all(promises);
  }

  return topics.flatMap(b => fragenCache.get(b) ?? []);
}

/**
 * Baut ein QuizData-Objekt from loaded topics.
 */
export async function buildQuizData(topics: string[]): Promise<QuizData> {
  const meta = await loadQuizMeta();
  const fragen = await loadTopicQuestions(topics);

  return {
    meta: {
      ...meta.meta,
      anzahl_fragen: fragen.length,
      topics: Object.fromEntries(
        topics.map(b => [b, fragen.filter(f => f.topic === b).length])
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
  return buildQuizData(meta.topics);
}

/**
 * Cache leeren (z.B. für Tests).
 */
export function clearQuizCache(): void {
  metaCache = null;
  fragenCache.clear();
}
