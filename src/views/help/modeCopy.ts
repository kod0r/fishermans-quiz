export interface ModeCopy {
  title: string;
  hook: string;
  bullets: string[];
  consequence: string;
}

export const MODE_COPY: Record<'arcade' | 'hardcore' | 'exam', ModeCopy> = {
  arcade: {
    title: 'Arcade',
    hook: 'Lerne in deinem Tempo — mit Sicherheitsnetz.',
    bullets: [
      'Du darfst jede Frage einmal wiederholen.',
      'Themen können jederzeit hinzugefügt oder entfernt werden.',
      'Sterne zeigen deinen Fortschritt pro Thema.',
    ],
    consequence: 'Falsche Antworten kosten keine Freischaltung.',
  },
  hardcore: {
    title: 'Hardcore',
    hook: 'Ein Fehler reicht — das Thema ist gesperrt.',
    bullets: [
      'Jede Frage darf nur einmal beantwortet werden.',
      'Ein Fehler sperrt das gesamte Thema sofort.',
      'Gesperrte Themen werden frei, sobald ein anderes Thema bestanden ist.',
    ],
    consequence: 'Nur wer alles richtig hat, meistert das Thema.',
  },
  exam: {
    title: 'Prüfung',
    hook: 'Realistische Prüfungssituation unter Zeitdruck.',
    bullets: [
      '60 zufällige Fragen aus allen Themen.',
      '60 Minuten Zeitlimit.',
      'Mindestens 60 % richtig zum Bestehen.',
    ],
    consequence: 'Das Ergebnis wird dauerhaft im Prüfungsprotokoll gespeichert.',
  },
};
