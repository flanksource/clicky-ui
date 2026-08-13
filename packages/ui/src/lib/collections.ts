// Immutable index-addressed list helpers, shared by every editable-list surface
// (the JsonSchemaForm array displays and the standalone AccordionList). They live
// in lib/ rather than beside the form so a generic component never has to import
// a json-schema-form-* module to reorder a list.

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function setIndex<T>(arr: T[], i: number, v: T): T[] {
  return arr.map((x, idx) => (idx === i ? v : x));
}

export function removeIndex<T>(arr: T[], i: number): T[] {
  return arr.filter((_, idx) => idx !== i);
}

// moveItem is a no-op past either boundary, so a caller may offer "up" on the
// first row without guarding first.
export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = [...arr];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved as T);
  return next;
}

// duplicateIndex copies the item at `index` and inserts the copy after it.
// Plain objects and arrays are cloned one level deep so editing the copy cannot
// write through to the original.
export function duplicateIndex<T>(items: T[], index: number, clone?: (item: T) => T): T[] {
  const source = items[index] as T;
  const copy = clone
    ? clone(source)
    : Array.isArray(source)
      ? ([...source] as T)
      : isPlainObject(source)
        ? ({ ...source } as T)
        : source;
  const next = [...items];
  next.splice(index + 1, 0, copy);
  return next;
}
