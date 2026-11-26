import { useState } from "react";

type ArrayRow = { item: unknown; key: number };
type RowSnapshot = {
  items: readonly unknown[];
  rows: ArrayRow[];
  nextKey: number;
  pendingRows?: ArrayRow[];
};

const EMPTY_ITEMS: readonly unknown[] = [];

function reconcileRows(items: readonly unknown[], previous?: RowSnapshot): RowSnapshot {
  let nextKey = previous?.nextKey ?? 0;
  const pending = previous?.pendingRows;
  if (pending?.length === items.length && pending.every((row, index) => Object.is(row.item, items[index]))) {
    return { items, rows: pending, nextKey };
  }

  const keysByItem = new Map<unknown, number[]>();
  for (const row of previous?.rows ?? []) {
    const keys = keysByItem.get(row.item);
    if (keys) keys.push(row.key);
    else keysByItem.set(row.item, [row.key]);
  }
  const rows = items.map((item) => ({ item, key: keysByItem.get(item)?.shift() ?? nextKey++ }));
  return { items, rows, nextKey };
}

export function useArrayRows(value: unknown) {
  const items = Array.isArray(value) ? value : EMPTY_ITEMS;
  const [snapshot, setSnapshot] = useState(() => reconcileRows(items));
  const current = snapshot.items === items ? snapshot : reconcileRows(items, snapshot);
  if (current !== snapshot) setSnapshot(current);

  // A grid edit replaces the item object. Remember its key until the form
  // commits the edited array, so typing does not remount the active cell.
  function rememberRows(rows: ArrayRow[]) {
    setSnapshot({ ...current, pendingRows: rows });
  }

  return { rows: current.rows, rememberRows };
}
