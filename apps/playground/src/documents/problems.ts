import { useSyncExternalStore } from "react";
import type { DocumentProblems } from "../../plugins/document-problems";
import { documentError, documentJson } from "./api";

let snapshot: { results: DocumentProblems; error: Error | null } = {
  results: {},
  error: null,
};
const listeners = new Set<() => void>();
let pending: Promise<void> | undefined;
export function refreshDocumentProblems(): Promise<void> {
  return (pending ??= documentJson<{ results: DocumentProblems }>(
    "/__playground/document-problems",
  )
    .then(({ results }) => {
      snapshot = { results, error: null };
    })
    .catch((cause: unknown) => {
      snapshot = {
        ...snapshot,
        error: documentError(cause),
      };
    })
    .finally(() => {
      pending = undefined;
      for (const listener of listeners) listener();
    }));
}

const onFocus = () => {
  void refreshDocumentProblems();
};
function subscribe(listener: () => void) {
  if (!listeners.size) {
    window.addEventListener("focus", onFocus);
    void refreshDocumentProblems();
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("focus", onFocus);
  };
}
export function useDocumentProblems() {
  return useSyncExternalStore(subscribe, () => snapshot);
}
