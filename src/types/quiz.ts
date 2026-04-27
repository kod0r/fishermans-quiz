export interface Frage {
  id: string;
  topic: string;
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
    topics: Record<string, number>;
  };
  fragen: Frage[];
}

// ── Session Type ──
export type SessionType = 'quiz' | 'flashcard';

// ── Self-Assessment Grade (Flashcard → SRS quality mapping) ──
export type SelfAssessmentGrade = 'again' | 'hard' | 'good' | 'easy';

// ── Quiz-Run (Session-basiert, nicht persistent) ──
export interface QuizRun {
  frageIds: string[];
  antworten: Record<string, string>;
  topics: string[];
  aktuellerIndex: number;
  isActive: boolean;
  startedAt?: string;
  durationSeconds?: number; // für zeitbegrenzte Modi (Exam)
  sessionType?: SessionType;
  selfAssessments?: Record<string, SelfAssessmentGrade>;
  completedAt?: string; // verhindert doppeltes Loggen
}

// ── History Entry ──
export interface HistoryEntry {
  id: string;
  timestamp: string;
  topics: string[];
  score: number;
  total: number;
  duration: number; // Sekunden
  mode: GameMode;
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
  arcadeRunsCompleted?: number;
}

export interface ExamMeta {
  attempts: number;
  passedCount: number;
  bestScore: number; // percentage 0–100
  lastScore: number;
}

export interface TopicMeta {
  passed: boolean;
  consecutivePasses: number;
  mastered: boolean;
  lastAttempt: string | null;
}

export interface MetaProgression {
  fragen: Record<string, FrageMeta>;
  stats: MetaStats;
  topics: Record<string, TopicMeta>;
  arcadeStars?: Record<string, 1 | 2 | 3>;
  bestArcadeScore?: Record<string, number>;
  examMeta?: ExamMeta;
}

// ── Game Mode ──
export type GameMode = 'arcade' | 'hardcore' | 'exam';

export interface AppSettings {
  gameMode: GameMode;
  backupReminderEnabled?: boolean;
  lastBackupPrompt?: string;
}

export interface AppBackup {
  version: '1';
  exportedAt: string;
  settings: AppSettings;
  metaArcade: MetaProgression;
  metaHardcore: MetaProgression;
  metaExam: MetaProgression;
  favorites: string[];
  notes: Record<string, string>;
  history: HistoryEntry[];
  srs: Record<string, SRSMeta>;
}

// ── Question Notes ──
export interface QuestionNotes {
  [frageId: string]: string;
}

// ── SRS Meta ──
export interface SRSMeta {
  interval: number; // days
  repetitions: number;
  efactor: number;
  nextReview: string; // ISO date
}

// ── Quiz Start Options ──
export interface QuizStartOptions {
  nurFavoriten?: boolean;
  filter?: 'weak' | 'all' | 'srs-due';
  limit?: number;
  sessionType?: SessionType;
}

// ── View-State ──
export type AppView = 'start' | 'quiz' | 'progress' | 'history' | 'browse';
