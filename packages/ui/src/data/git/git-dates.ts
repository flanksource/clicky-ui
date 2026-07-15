function validDate(iso?: string): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function dateKey(iso?: string): string {
  const date = validDate(iso);
  if (!date) return "unknown";
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function formatGitCommitDateHeader(iso?: string): string {
  const date = validDate(iso);
  if (!date) return "Commits on unknown date";
  const formatted = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
  return `Commits on ${formatted}`;
}

export function formatFallbackTime(iso: string): string {
  const date = validDate(iso);
  if (!date) return iso;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
