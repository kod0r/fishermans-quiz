import type { GameMode } from "@/types/quiz";

// ── Legacy Keys (v2, pre-mode-split) ──
const LEGACY_KEY_RUN = "fmq:run:v2";
const LEGACY_KEY_META = "fmq:meta:v2";

// ── Mode-specific Keys ──
const runKey = (mode: GameMode) => `fmq:run:${mode}:v2`;
const metaKey = (mode: GameMode) => `fmq:meta:${mode}:v2`;

/**
 * Einmalige Migration beim App-Start:
 * Verschiebt Legacy-Run und Legacy-Meta in den Arcade-Slot,
 * damit bestehende Nutzer ihren Fortschritt behalten.
 */
let migrationDone = false;
export function migrateLegacyStorage(): void {
  if (migrationDone) return;
  migrationDone = true;

  try {
    const legacyRun = localStorage.getItem(LEGACY_KEY_RUN);
    if (legacyRun) {
      localStorage.setItem(runKey("arcade"), legacyRun);
      localStorage.removeItem(LEGACY_KEY_RUN);
      console.log("[Storage] Migrated legacy run → arcade");
    }

    const legacyMeta = localStorage.getItem(LEGACY_KEY_META);
    if (legacyMeta) {
      localStorage.setItem(metaKey("arcade"), legacyMeta);
      localStorage.removeItem(LEGACY_KEY_META);
      console.log("[Storage] Migrated legacy meta → arcade");
    }
  } catch {
    console.warn("[Storage] Migration failed");
  }
}
