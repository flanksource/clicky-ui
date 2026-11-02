/** How long ago, in the largest whole unit up to days. */
export function ago(ms: number): string {
  const units: [number, string][] = [[86_400_000, "d"], [3_600_000, "h"], [60_000, "m"]];
  const [size, unit] = units.find(([size]) => ms >= size) ?? [1000, "s"];
  return `${Math.max(0, Math.round(ms / size))}${unit} ago`;
}

/** A round axis step that splits total into about ticks steps. */
export function niceStep(total: number, ticks: number): number {
  const raw = total / ticks;
  const power = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map(multiple => multiple * power).find(step => step >= raw)!;
}

