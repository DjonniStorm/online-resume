export function readPageSize(key: string, options: readonly number[], fallback: number): number {
  try {
    const stored = localStorage.getItem(key);
    const value = stored === null ? Number.NaN : Number(stored);
    return options.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export function savePageSize(key: string, value: number): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Недоступное хранилище не мешает менять размер страницы в текущей вкладке.
  }
}
