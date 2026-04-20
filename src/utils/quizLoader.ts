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

  const res = await fetch('data/quiz_meta.json');
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

      const res = await fetch(`data/bereiche/${filename}`);
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
