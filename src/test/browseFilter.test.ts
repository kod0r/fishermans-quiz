import { describe, it, expect } from 'vitest';
import { filterFragen } from '@/utils/filter';
import type { Frage, FrageMeta, SRSMeta } from '@/types/quiz';

const mockFragen: Frage[] = [
  { id: '1', topic: 'Biologie', frage: 'Was ist ein Lachs?', antworten: { A: 'Fisch', B: 'Vogel', C: 'Säugetier' }, richtige_antwort: 'A' },
  { id: '2', topic: 'Biologie', frage: 'Welche Schuppe hat die Forelle?', antworten: { A: 'Rund', B: 'Cycloid', C: 'Placoid' }, richtige_antwort: 'B', bild: true, bild_url: '/img/forelle.jpg' },
  { id: '3', topic: 'Recht', frage: 'Wie viele Ruten darf man haben?', antworten: { A: '1', B: '2', C: '3' }, richtige_antwort: 'B' },
  { id: '4', topic: 'Recht', frage: 'Was ist die Mindestgröße?', antworten: { A: '30cm', B: '40cm', C: '50cm' }, richtige_antwort: 'A' },
  { id: '5', topic: 'Gewässerkunde', frage: 'Welcher Fluss ist der längste?', antworten: { A: 'Donau', B: 'Rhein', C: 'Elbe' }, richtige_antwort: 'A' },
  { id: '6', topic: 'Gewässerkunde', frage: 'Was ist ein Tümpel?', antworten: { A: 'See', B: 'Teich', C: 'Fluss' }, richtige_antwort: 'B', bild: true },
];

const mockFavorites = ['1', '3'];
const mockMetaProgress: Record<string, FrageMeta> = {
  '1': { attempts: 5, correctStreak: 3, lastResult: 'correct', firstSeen: '2026-01-01', lastAttempt: '2026-04-01' },
  '2': { attempts: 2, correctStreak: 1, lastResult: 'incorrect', firstSeen: '2026-01-01', lastAttempt: '2026-04-01' },
  '3': { attempts: 0, correctStreak: 0, lastResult: null, firstSeen: '2026-01-01', lastAttempt: '2026-04-01' },
};
const mockSRSMap: Record<string, SRSMeta> = {
  '1': { interval: 10, repetitions: 3, efactor: 2.5, nextReview: '2026-05-01' },
};

const ctx = { favorites: mockFavorites, metaProgress: mockMetaProgress, srsMap: mockSRSMap };

describe('filterFragen', () => {
  it('sollte alle Fragen zurückgeben ohne Filter', () => {
    expect(filterFragen(mockFragen, {}, ctx)).toHaveLength(6);
  });

  it('sollte nach Text suchen (case insensitive)', () => {
    expect(filterFragen(mockFragen, { query: 'LACHS' }, ctx)).toHaveLength(1);
  });

  it('sollte nach Text suchen (partial match)', () => {
    expect(filterFragen(mockFragen, { query: 'Rute' }, ctx)).toHaveLength(1);
  });

  it('sollte keine Treffer bei leerem Query zurückgeben', () => {
    expect(filterFragen(mockFragen, { query: 'xyz' }, ctx)).toHaveLength(0);
  });

  it('sollte nach Topic filtern (single)', () => {
    const result = filterFragen(mockFragen, { topics: ['Biologie'] }, ctx);
    expect(result).toHaveLength(2);
    expect(result.every((f) => f.topic === 'Biologie')).toBe(true);
  });

  it('sollte nach Topic filtern (multiple)', () => {
    expect(filterFragen(mockFragen, { topics: ['Biologie', 'Recht'] }, ctx)).toHaveLength(4);
  });

  it('sollte nach Bild filtern', () => {
    expect(filterFragen(mockFragen, { hasImage: true }, ctx).map((f) => f.id).sort()).toEqual(['2', '6']);
  });

  it('sollte nach Favoriten filtern', () => {
    expect(filterFragen(mockFragen, { onlyFavorites: true }, ctx).map((f) => f.id).sort()).toEqual(['1', '3']);
  });

  it('sollte nach Mastery filtern (mastered)', () => {
    expect(filterFragen(mockFragen, { masteryFilter: 'mastered' }, ctx)).toHaveLength(1);
  });

  it('sollte nach Mastery filtern (unmastered)', () => {
    const result = filterFragen(mockFragen, { masteryFilter: 'unmastered' }, ctx);
    expect(result.some((f) => f.id === '1')).toBe(false);
  });

  it('sollte kombinierte Filter anwenden', () => {
    const result = filterFragen(mockFragen, { query: 'Forelle', topics: ['Biologie', 'Recht'], hasImage: true }, ctx);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('sollte trim und lowercase bei Query anwenden', () => {
    expect(filterFragen(mockFragen, { query: '  LACHS  ' }, ctx)[0].id).toBe('1');
  });
});
