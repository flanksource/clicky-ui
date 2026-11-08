// Computed-style comparison between two renders of the same page.

export type Snapshot = { selectors: string[]; styles: string[][] };
export type Difference = { element: string; property: string; runtime: string; reference: string; count: number };
export type Comparison = { elements: number; differingElements: number; customPropertyDiffs: number; reorderedTransitions: number; differences: Difference[] };

/** Splits a computed list value at its top-level commas (`cubic-bezier(…, …)` stays one entry). */
export function listEntries(value: string): string[] {
  const entries: string[] = [];
  let depth = 0;
  let current = "";
  for (const character of value) {
    if (character === "(") depth += 1;
    if (character === ")") depth -= 1;
    if (character === "," && depth === 0) {
      entries.push(current.trim());
      current = "";
    } else current += character;
  }
  entries.push(current.trim());
  return entries;
}

const TRANSITION_LISTS = ["transition-duration", "transition-timing-function", "transition-delay", "transition-behavior"];

/**
 * Each transitioned property with the duration, timing function, delay and behavior it gets: a shorter list repeats
 * to the length of `transition-property`, as CSS Transitions specifies.
 */
function transitions(style: Map<string, string>): string[] {
  const lists = TRANSITION_LISTS.map((property) => listEntries(style.get(property) ?? ""));
  return listEntries(style.get("transition-property") ?? "")
    .map((property, index) => [property, ...lists.map((list) => list[index % list.length])].join(" "))
    .sort();
}

/**
 * Two transition declarations are equivalent when they give every property the same transition, whatever the order.
 * Lightning CSS emits prefixed declarations ahead of the standard one, so the reference lists
 * `-webkit-text-decoration` before `text-decoration`.
 */
export function equivalentTransition(ours: Map<string, string>, theirs: Map<string, string>): boolean {
  return transitions(ours).join(",") === transitions(theirs).join(",");
}

function styleMap(values: string[]): Map<string, string> {
  return new Map(values.map((entry) => [entry.slice(0, entry.indexOf(":")), entry.slice(entry.indexOf(":") + 1)]));
}

/**
 * Compares two snapshots of the same page element by element. Custom properties compute to their token text, so a
 * minifier's respelling (`rgb(59 130 246 / 0.5)` as `#3b82f680`) differs there without changing any rendered style;
 * they are counted apart, and their effect is compared through the standard properties that read them.
 */
export function compare(runtime: Snapshot, reference: Snapshot): Comparison {
  if (runtime.selectors.join("\n") !== reference.selectors.join("\n")) {
    throw new Error(`the two renders differ in their elements (${runtime.selectors.length} and ${reference.selectors.length})`);
  }
  // Grouped by element selector, property and both values, so repeated rows report one entry with a count.
  const differences = new Map<string, Difference>();
  let differingElements = 0;
  let customPropertyDiffs = 0;
  let reorderedTransitions = 0;
  runtime.styles.forEach((values, index) => {
    const ours = styleMap(values);
    const theirs = styleMap(reference.styles[index] ?? []);
    const element = runtime.selectors[index] ?? "";
    let differs = false;
    for (const property of new Set([...ours.keys(), ...theirs.keys()])) {
      const value = ours.get(property) ?? "";
      const other = theirs.get(property) ?? "";
      if (value === other) continue;
      if (property.startsWith("--")) {
        customPropertyDiffs += 1;
        continue;
      }
      if (property === "transition-property" && equivalentTransition(ours, theirs)) {
        reorderedTransitions += 1;
        continue;
      }
      differs = true;
      const key = [element, property, value, other].join("\u0000");
      const entry = differences.get(key);
      if (entry) entry.count += 1;
      else differences.set(key, { element, property, runtime: value, reference: other, count: 1 });
    }
    if (differs) differingElements += 1;
  });
  const sorted = [...differences.values()].sort((a, b) => b.count - a.count).slice(0, 200);
  return { elements: runtime.styles.length, differingElements, customPropertyDiffs, reorderedTransitions, differences: sorted };
}
