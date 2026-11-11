import { editableOpenings } from "./editable-jsx";
import { sourceHash } from "./source-hash";

type Step = { hash: string; ordinals: Array<number | null> };
export type VisualEditLineage = Map<string, Map<string, Step>>;
export const sharedLineage: VisualEditLineage = new Map();

export function recordSourceEdit({ lineage = sharedLineage, file, before, after, deleted }: { lineage?: VisualEditLineage; file: string; before: string; after: string; deleted?: { ordinal: number; count: number } }) {
  let prefix = 0;
  while (prefix < before.length && prefix < after.length && before[prefix] === after[prefix]) prefix++;
  let suffix = 0;
  while (suffix < before.length - prefix && suffix < after.length - prefix && before[before.length - 1 - suffix] === after[after.length - 1 - suffix]) suffix++;
  const next = editableOpenings(after, file);
  const ordinals = editableOpenings(before, file).map(opening => {
    if (deleted) return opening.ordinal < deleted.ordinal ? opening.ordinal : opening.ordinal < deleted.ordinal + deleted.count ? null : opening.ordinal - deleted.count;
    const offset = opening.start <= prefix ? opening.start : opening.start >= before.length - suffix ? opening.start + after.length - before.length : null;
    return offset === null ? null : next.find(candidate => candidate.start === offset && candidate.tag === opening.tag)?.ordinal ?? null;
  });
  const steps = lineage.get(file) ?? new Map<string, Step>();
  steps.set(sourceHash(before), { hash: sourceHash(after), ordinals });
  lineage.set(file, steps);
}

export function resolveOrdinal(options: { lineage: VisualEditLineage; file: string; from: string; to: string; ordinal: number }): number | null {
  let { from, ordinal } = options;
  const seen = new Set<string>();
  while (from !== options.to && !seen.has(from)) {
    seen.add(from);
    const step = options.lineage.get(options.file)?.get(from);
    const next = step?.ordinals[ordinal];
    if (!step || next === null || next === undefined) return null;
    from = step.hash; ordinal = next;
  }
  return from === options.to ? ordinal : null;
}
