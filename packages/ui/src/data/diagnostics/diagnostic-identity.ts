/** Assign before filtering: identical diagnostics remain separate occurrences. */
export function diagnosticKeys(
  identities: readonly (readonly unknown[])[],
): string[] {
  const counts = new Map<string, number>();
  return identities.map((identity) => {
    const key = JSON.stringify(identity);
    const occurrence = counts.get(key) ?? 0;
    counts.set(key, occurrence + 1);
    return `${key}:${occurrence}`;
  });
}
