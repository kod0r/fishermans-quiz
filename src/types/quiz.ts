export interface Frage {
  id: string;
  bereich: string;
  frage: string;
  antworten: {
    A: string;
    B: string;
    C: string;
  };
  richtige_antwort: 'A' | 'B' | 'C';
  bild?: boolean;
  bild_url?: string;
}

export interface QuizData {
  meta: {
    titel: string;
    anzahl_fragen: number;
    bereiche: Record<string, number>;
  };
  fragen: Frage[];
}

// ── Quiz-Run (Session-basiert, nicht persistent) ──
export interface QuizRun {
  frageIds: string[];
  antworten: Record<string, string>;
  bereiche: string[];
  aktuellerIndex: number;
  isActive: boolean;
}

// ── Meta-Progression (persistent über alle Runs) ──
export interface FrageMeta {
  attempts: number;
  correctStreak: number;
  lastResult: 'correct' | 'incorrect' | null;
  firstSeen: string;
  lastAttempt: string;
}

export interface MetaStats {
  totalRuns: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  totalIncorrect: number;
  bestStreak: number;
  currentStreak: number;
}

export interface MetaProgression {
  fragen: Record<string, FrageMeta>;
  stats: MetaStats;
}

// ── Game Mode ──
export type GameMode = 'arcade' | 'hardcore';

export interface AppSettings {
  gameMode: GameMode;
}

// ── View-State ──
export type AppView = 'start' | 'quiz' | 'progress';
