export function metric(value: number | undefined, format: (value: number) => string = value => value.toLocaleString()): string {
  return value === undefined ? "—" : format(value);
}
