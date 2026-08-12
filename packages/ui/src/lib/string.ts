export function stripLeadingSlashes(value: string): string {
  let start = 0;
  while (start < value.length && value[start] === "/") start++;
  return value.slice(start);
}

export function stripTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value[end - 1] === "/") end--;
  return value.slice(0, end);
}

// Linear scan instead of `.replace(/^-+|-+$/g, "")`: the anchored `-+`
// alternatives backtrack polynomially on slugs made of many dashes.
export function stripSurroundingDashes(value: string): string {
  let start = 0;
  let end = value.length;
  while (start < end && value[start] === "-") start++;
  while (end > start && value[end - 1] === "-") end--;
  return value.slice(start, end);
}
