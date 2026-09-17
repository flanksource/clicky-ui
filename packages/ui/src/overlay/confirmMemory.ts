const PREFIX = "clicky-ui:confirm:";
const CONFIRMED = "confirmed";

const listeners = new Set<() => void>();

/**
 * The browser store, or null where it cannot be used. Merely reading
 * `window.localStorage` throws in a sandboxed frame or with site data blocked,
 * so the probe is the access itself.
 *
 * Null means "never remembered": a store that cannot be read must not be
 * mistaken for an approval, so the prompt keeps showing.
 */
function store(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    const storage = window.localStorage;
    storage.getItem(PREFIX);
    return storage;
  } catch {
    return null;
  }
}

/** Whether a "remember my choice" answer can be persisted at all. */
export function canRememberConfirm(): boolean {
  return store() !== null;
}

export function isConfirmRemembered(key: string): boolean {
  return store()?.getItem(PREFIX + key) === CONFIRMED;
}

export function rememberConfirm(key: string): void {
  const storage = store();
  if (!storage) throw new Error(`cannot remember confirmation "${key}": localStorage is unavailable`);
  storage.setItem(PREFIX + key, CONFIRMED);
  notify();
}

export function forgetConfirm(key: string): void {
  store()?.removeItem(PREFIX + key);
  notify();
}

/** Subscribes to remember/forget in this tab and to storage edits in others. */
export function subscribeConfirmMemory(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function notify() {
  for (const listener of listeners) listener();
}
