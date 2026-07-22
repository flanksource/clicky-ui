export function formatEventTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function formatEventRange(
  start: string | undefined,
  end: string | undefined,
) {
  if (!start) return end ? formatEventTime(end) : undefined;
  if (!end || end === start) return formatEventTime(start);
  return `${formatEventTime(start)} – ${formatEventTime(end)}`;
}
