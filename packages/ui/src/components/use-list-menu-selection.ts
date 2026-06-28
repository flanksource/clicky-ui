import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

export interface ListMenuSelection {
  /** Selected keys in the order they appear in `keys`. */
  selectedKeys: string[];
  /** Membership set for O(1) lookups. */
  selected: Set<string>;
  isSelected: (key: string) => boolean;
  /** Toggle a key; pass `{ shiftKey: true }` to extend the range from the anchor. */
  toggle: (key: string, modifiers?: { shiftKey?: boolean }) => void;
  /** Replace the entire selection with the given keys. */
  set: (keys: string[]) => void;
  selectAll: () => void;
  clear: () => void;
  /** True when every key in `keys` is selected (and there is at least one). */
  allSelected: boolean;
  /** True when some — but not all — keys are selected. */
  someSelected: boolean;
  /** Number of selected keys. */
  count: number;
}

export interface UseListMenuSelectionOptions {
  /** Ordered selectable keys; required for Shift+Click ranges and select-all. */
  keys: string[];
  /** Controlled selection — when set, the hook does not own selection state. */
  selectedKeys?: string[];
  /** Initial selection when uncontrolled. */
  defaultSelectedKeys?: string[];
  /** Fires with the next selection (ordered by `keys`) on every change. */
  onSelectionChange?: (keys: string[]) => void;
}

export function useListMenuSelection(
  options: UseListMenuSelectionOptions,
): ListMenuSelection {
  const { keys, selectedKeys: controlled, defaultSelectedKeys, onSelectionChange } = options;
  const isControlled = controlled !== undefined;
  const [localSet, setLocalSet] = useState<Set<string>>(
    () => new Set(defaultSelectedKeys ?? []),
  );
  const anchorRef = useRef<string | null>(null);

  const selected = useMemo(
    () => (isControlled ? new Set(controlled) : localSet),
    [isControlled, controlled, localSet],
  );

  const commit = useCallback(
    (next: Set<string>) => {
      if (!isControlled) setLocalSet(next);
      onSelectionChange?.(keys.filter((key) => next.has(key)));
    },
    [isControlled, onSelectionChange, keys],
  );

  const toggle = useCallback(
    (key: string, modifiers?: { shiftKey?: boolean }) => {
      const next = new Set(selected);
      const anchor = anchorRef.current;
      if (modifiers?.shiftKey && anchor !== null) {
        const from = keys.indexOf(anchor);
        const to = keys.indexOf(key);
        if (from !== -1 && to !== -1) {
          const [lo, hi] = from <= to ? [from, to] : [to, from];
          for (let i = lo; i <= hi; i += 1) next.add(keys[i]!);
          commit(next);
          return;
        }
      }
      if (next.has(key)) next.delete(key);
      else next.add(key);
      anchorRef.current = key;
      commit(next);
    },
    [selected, keys, commit],
  );

  const set = useCallback(
    (next: string[]) => {
      anchorRef.current = null;
      commit(new Set(next));
    },
    [commit],
  );

  const selectAll = useCallback(() => commit(new Set(keys)), [commit, keys]);

  const clear = useCallback(() => {
    anchorRef.current = null;
    commit(new Set());
  }, [commit]);

  const selectedKeys = useMemo(() => keys.filter((key) => selected.has(key)), [keys, selected]);
  const allSelected = keys.length > 0 && keys.every((key) => selected.has(key));

  return {
    selectedKeys,
    selected,
    isSelected: (key) => selected.has(key),
    toggle,
    set,
    selectAll,
    clear,
    allSelected,
    someSelected: selectedKeys.length > 0 && !allSelected,
    count: selectedKeys.length,
  };
}

export interface ListMenuSelectionContextValue {
  selection: ListMenuSelection;
  /** Whether selectable rows render a leading checkbox. */
  showCheckboxes: boolean;
}

export const ListMenuSelectionContext = createContext<ListMenuSelectionContextValue | null>(null);

export function useListMenuSelectionContext(): ListMenuSelectionContextValue | null {
  return useContext(ListMenuSelectionContext);
}
