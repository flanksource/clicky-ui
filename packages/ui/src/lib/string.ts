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
