/**
 * Multi-field sort. The order of the entries is the tie-break order the backend
 * applies, so moving an entry is an edit in its own right rather than cosmetic.
 */

import type { EsSortBy } from "./esQueryBuilderModel";

/** moveSortEntry shifts one entry, clamping at the ends rather than wrapping. */
export function moveSortEntry(
  sort: EsSortBy[],
  index: number,
  delta: number,
): EsSortBy[] {
  const target = index + delta;
  if (target < 0 || target >= sort.length) return sort;
  const moved = [...sort];
  const [entry] = moved.splice(index, 1);
  if (!entry) throw new Error(`sort entry ${index} does not exist`);
  moved.splice(target, 0, entry);
  return moved;
}
