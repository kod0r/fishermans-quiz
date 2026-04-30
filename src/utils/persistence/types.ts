export interface PersistenceAdapter<T = unknown> {
  load: (key: string) => T | null;
  save: (key: string, value: T) => void;
  clear: (key: string) => void;
}
