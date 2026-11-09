import {
  createContext,
  useCallback,
  useContext,
  useState,
  useSyncExternalStore,
  type SetStateAction,
} from "react";

export type Store = ReturnType<typeof createStore>;
export const Context = createContext<Store | null>(null);

export function createStore(scope: string) {
  const prefix = `clicky.comment.${encodeURIComponent(scope)}.`;
  const listeners = new Set<() => void>();
  const values = new Map<string, unknown>();
  let error: string | null = null;
  let version = 0;
  const notify = () => {
    version++;
    listeners.forEach((listener) => listener());
    window.dispatchEvent(new Event("playground-comment-state"));
  };
  return {
    discardDraft(key: string) {
      const base = key.replace(/:body$/, "");
      this.write(`${base}:body`, "");
      this.write(`${base}:facets`, {});
      this.write(`${base}:rating`, undefined);
      this.write(`${base}:mentions`, []);
      this.write(`${base}:open`, false);
    },
    get version() {
      return version;
    },
    drafts() {
      const keys = new Set(values.keys());
      try {
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key?.startsWith(prefix)) keys.add(key.slice(prefix.length));
        }
      } catch (cause) {
        error = `Comment recovery unavailable: ${String(cause)}`;
      }
      return [...keys]
        .filter((key) => key.startsWith("draft:") && key.endsWith(":body"))
        .flatMap((key) => {
          const body = this.read<unknown>(key, "");
          return typeof body === "string" && body.trim() ? [{ key, body }] : [];
        });
    },
    get error() {
      return error;
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    read<T>(key: string, initial: T): T {
      if (!values.has(key)) {
        try {
          const saved = sessionStorage.getItem(prefix + key);
          values.set(key, saved === null ? initial : JSON.parse(saved));
        } catch (cause) {
          error = `Comment recovery unavailable: ${String(cause)}`;
          values.set(key, initial);
        }
      }
      return values.get(key) as T;
    },
    write<T>(key: string, value: T) {
      values.set(key, value);
      try {
        for (const [entry, saved] of values) {
          if (saved === undefined) sessionStorage.removeItem(prefix + entry);
          else sessionStorage.setItem(prefix + entry, JSON.stringify(saved));
        }
        error = null;
      } catch (cause) {
        error = `Comment recovery unavailable: ${String(cause)}`;
      }
      notify();
    },
  };
}

export function useDiscardCommentDraft() {
  const store = useContext(Context);
  return (anchor: string) => store?.discardDraft(`draft:create:${anchor}:body`);
}

export function useCommentState<T>(
  key: string,
  initial: T,
): [T, (next: SetStateAction<T>) => void] {
  const store = useContext(Context);
  const [fallback, setFallback] = useState(initial);
  const value = useSyncExternalStore(
    store?.subscribe ?? (() => () => {}),
    () => (store ? store.read(key, fallback) : fallback),
  );
  const update = useCallback(
    (next: SetStateAction<T>) => {
      if (!store) {
        setFallback(next);
        return;
      }
      const updated =
        typeof next === "function"
          ? (next as (previous: T) => T)(store.read(key, initial))
          : next;
      store.write(key, updated);
    },
    [store, key, initial],
  );
  return [value, update];
}
