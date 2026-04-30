export interface PersistenceAdapter {
  load: (key: string) => unknown;
  save: (key: string, value: unknown) => void;
  clear: (key: string) => void;
}
