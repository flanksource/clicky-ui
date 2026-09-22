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

// Linear scan instead of `.replace(/^[-_]+|[-_]+$/g, "")`: the unanchored
// trailing alternative retries from every run character, so a value made of
// many of them costs O(n²).
export function stripSurroundingChars(value: string, chars: string): string {
  let start = 0;
  let end = value.length;
  while (start < end && chars.includes(value[start]!)) start++;
  while (end > start && chars.includes(value[end - 1]!)) end--;
  return value.slice(start, end);
}

export function stripTrailingNewlines(value: string): string {
  let end = value.length;
  while (end > 0 && value[end - 1] === "\n") end--;
  return value.slice(0, end);
}

// Linear scan instead of `.replace(/<[^>]+>/g, " ")`, whose `[^>]+` rescans the
// whole tail from every `<` in a run of them.
export function stripHtmlTags(value: string, replacement = " "): string {
  let out = "";
  let index = 0;
  while (index < value.length) {
    const open = value.indexOf("<", index);
    if (open === -1) return out + value.slice(index);
    const close = value.indexOf(">", open + 1);
    if (close === -1) return out + value.slice(index);
    // `<>` has no tag name, so the regex this replaces left it as text.
    if (close === open + 1) {
      out += value.slice(index, close + 1);
      index = close + 1;
      continue;
    }
    out += value.slice(index, open) + replacement;
    index = close + 1;
  }
  return out;
}
