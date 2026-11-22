interface TailBufferOptions<T> {
  limit: number;
  key?: (row: T) => string;
  order?: (rows: T[]) => T[];
}

export function appendTailRows<T>(current: readonly T[], incoming: readonly T[], options: TailBufferOptions<T>) {
  const { key, order, limit } = options;
  const rows = [...current, ...incoming];
  const unique = key ? [...new Map(rows.map(row => [key(row), row])).values()] : rows;
  const sorted = order ? order(unique) : unique;
  const dropped = Math.max(0, sorted.length - Math.max(1, limit));
  return { rows: sorted.slice(dropped), dropped };
}
