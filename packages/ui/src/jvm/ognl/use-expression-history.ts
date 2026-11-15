import { useCallback, useState } from "react";
import type { ExpressionLanguage } from "../model/expressions";

export function expressionHistoryStorageKey(historyKey: string, language: ExpressionLanguage): string {
  return `clicky-ui.jvm.expressions.${historyKey}.${language}`;
}

// History is a per-viewer convenience: blocked storage or an unreadable entry leaves it empty, never breaks the console.
function readHistory(storageKey: string): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(parsed) && parsed.every((entry) => typeof entry === "string") ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(storageKey: string, history: string[]) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(history));
  } catch {
    // Storage is unavailable (private window, blocked site data); the history lives in memory only.
  }
}

/** Newest-first expression history kept in localStorage under `storageKey`; in memory only when the key is undefined. */
export function useExpressionHistory(storageKey: string | undefined): [string[], (history: string[]) => void] {
  const [history, setHistory] = useState<string[]>(() => (storageKey ? readHistory(storageKey) : []));
  const update = useCallback(
    (next: string[]) => {
      setHistory(next);
      if (storageKey) writeHistory(storageKey, next);
    },
    [storageKey],
  );
  return [history, update];
}
