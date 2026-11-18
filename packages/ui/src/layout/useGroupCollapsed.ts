import { useEffect, useState } from "react";
import type { GroupState } from "./AppShell.nav";

function readGroupState(storageKey: string): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, boolean>)
      : {};
  } catch {
    return {};
  }
}

export function useGroupCollapsed(storageKey: string): GroupState {
  const [state, setState] = useState<Record<string, boolean>>(() =>
    readGroupState(storageKey),
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Rail state is a UX nicety; private-mode storage failures are safe to swallow.
    }
  }, [state, storageKey]);
  return {
    isCollapsed: (key, fallback) => state[key] ?? fallback,
    toggle: (key, fallback) =>
      setState((prev) => ({ ...prev, [key]: !(prev[key] ?? fallback) })),
  };
}
