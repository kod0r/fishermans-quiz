import { describe, it, expect } from 'vitest';
import { escapeCsvField, buildCsv } from '@/utils/csvExport';

describe('csvExport', () => {
  describe('escapeCsvField', () => {
    it('sollte einfache Texte unverändert lassen', () => {
      expect(escapeCsvField('Hallo')).toBe('Hallo');
      expect(escapeCsvField(123)).toBe('123');
    });

    it('sollte Felder mit Komma in Anführungszeichen setzen', () => {
      expect(escapeCsvField('Was ist 2,4-D?')).toBe('"Was ist 2,4-D?"');
    });

    it('sollte Felder mit Newline in Anführungszeichen setzen', () => {
      expect(escapeCsvField('Zeile 1\nZeile 2')).toBe('"Zeile 1\nZeile 2"');
    });

    it('sollte Felder mit Carriage Return in Anführungszeichen setzen', () => {
      expect(escapeCsvField('Zeile 1\rZeile 2')).toBe('"Zeile 1\rZeile 2"');
    });

    it('sollte Anführungszeichen verdoppeln', () => {
      expect(escapeCsvField('Sag "Hallo"')).toBe('"Sag ""Hallo"""');
    });
  });

  describe('buildCsv', () => {
    it('sollte eine gültige CSV mit CRLF erzeugen', () => {
      const rows = [
        ['Name', 'Wert'],
        ['Test', '42'],
      ];
      expect(buildCsv(rows)).toBe('Name,Wert\r\nTest,42');
    });

    it('sollte Kommas und Newlines korrekt escapen', () => {
      const rows = [
        ['Frage', 'Antwort'],
        ['Was ist 2,4-D?', 'Ein\nHerbizid'],
      ];
      expect(buildCsv(rows)).toBe(
        'Frage,Antwort\r\n"Was ist 2,4-D?","Ein\nHerbizid"'
      );
    });
  });
});
