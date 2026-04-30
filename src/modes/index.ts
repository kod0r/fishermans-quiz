import type { GameMode } from '@/types/quiz';
import type { ModePolicy } from './types';
import { ArcadePolicy } from './arcade';
import { HardcorePolicy } from './hardcore';
import { ExamPolicy } from './exam';

export const MODE_POLICIES: Record<GameMode, ModePolicy> = {
  arcade: ArcadePolicy,
  hardcore: HardcorePolicy,
  exam: ExamPolicy,
};

export { ArcadePolicy } from './arcade';
export { HardcorePolicy } from './hardcore';
export { ExamPolicy } from './exam';

export type { ModePolicy, AnswerEffect, AbortEffect, CompleteEffect, ModeSwitchEffect } from './types';
