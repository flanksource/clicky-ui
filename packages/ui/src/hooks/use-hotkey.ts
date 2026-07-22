import { useEffect, useId, useRef } from "react";

// A process-wide registry of global keyboard shortcuts, modeled on the escape
// layer in ../overlay/modalStack. Bindings mount independently (no shared
// provider), so the registry lives at module scope. Exactly ONE binding wins a
// given key combo — the highest `priority`, breaking ties toward the most
// recently mounted. Without that discipline every mounted component that binds
// the same combo fires on one keypress, which is how two ⌘K search fields end
// up racing to focus themselves.
//
// The listener is attached to `document`, matching modalStack, so hotkeys and
// escape layers agree on event target and ordering.

type Registration = {
  id: string;
  combo: ParsedHotkey;
  priority: number;
  enableOnFormElements: boolean;
  run: (event: KeyboardEvent) => void;
};

const registrations: Registration[] = [];
let boundDocument: Document | null = null;

export type ParsedHotkey = {
  /** Bare key, lower-cased (e.g. "k"). */
  key: string;
  /** Requires cmd on macOS / ctrl elsewhere. */
  mod: boolean;
  shift: boolean;
  alt: boolean;
};

function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  return /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);
}

/**
 * Parses a combo string such as `"mod+k"` or `"mod+shift+p"`. `mod` means ⌘ on
 * macOS and Ctrl elsewhere. The last segment is the key; order is irrelevant.
 */
export function parseHotkey(combo: string): ParsedHotkey {
  const parts = combo
    .split("+")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  const key = parts[parts.length - 1];
  if (!key) throw new Error(`useHotkey: empty combo "${combo}"`);
  return {
    key,
    mod: parts.includes("mod") || parts.includes("cmd") || parts.includes("ctrl"),
    shift: parts.includes("shift"),
    alt: parts.includes("alt") || parts.includes("option"),
  };
}

/**
 * Renders a combo for display — `"mod+k"` becomes `"⌘K"` on macOS and `"Ctrl+K"`
 * elsewhere. Deriving the label from the combo (rather than hand-authoring the
 * label and reverse-engineering the key from it) keeps the two in sync.
 */
export function formatHotkey(combo: string, platform?: "mac" | "other"): string {
  const parsed = parseHotkey(combo);
  const mac = platform ? platform === "mac" : isMacPlatform();
  const key = parsed.key.length === 1 ? parsed.key.toUpperCase() : titleCase(parsed.key);
  if (mac) {
    return `${parsed.mod ? "⌘" : ""}${parsed.alt ? "⌥" : ""}${parsed.shift ? "⇧" : ""}${key}`;
  }
  const segments = [
    ...(parsed.mod ? ["Ctrl"] : []),
    ...(parsed.alt ? ["Alt"] : []),
    ...(parsed.shift ? ["Shift"] : []),
    key,
  ];
  return segments.join("+");
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function matches(event: KeyboardEvent, combo: ParsedHotkey): boolean {
  if (event.key.toLowerCase() !== combo.key) return false;
  if (combo.mod !== (event.metaKey || event.ctrlKey)) return false;
  if (combo.shift !== event.shiftKey) return false;
  if (combo.alt !== event.altKey) return false;
  return true;
}

function isFormElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

function onKeyDown(event: KeyboardEvent) {
  if (event.defaultPrevented || event.isComposing) return;

  // Highest priority wins; ties go to the most recently registered, so a
  // transient surface layered over the page takes precedence over the chrome.
  let winner: Registration | undefined;
  for (const registration of registrations) {
    if (!matches(event, registration.combo)) continue;
    if (!registration.enableOnFormElements && isFormElement(event.target)) continue;
    if (!winner || registration.priority >= winner.priority) winner = registration;
  }
  if (!winner) return;

  event.preventDefault();
  winner.run(event);
}

function ensureListener() {
  if (boundDocument || typeof document === "undefined") return;
  boundDocument = document;
  boundDocument.addEventListener("keydown", onKeyDown);
}

function unregister(id: string) {
  const index = registrations.findIndex((entry) => entry.id === id);
  if (index !== -1) registrations.splice(index, 1);

  if (registrations.length === 0 && boundDocument) {
    boundDocument.removeEventListener("keydown", onKeyDown);
    boundDocument = null;
  }
}

export type UseHotkeyOptions = {
  /** Register the binding. Defaults to `true`. */
  enabled?: boolean | undefined;
  /**
   * Ordering among bindings for the same combo. Higher wins; ties break toward
   * the most recently mounted. Defaults to `0`.
   */
  priority?: number | undefined;
  /**
   * Fire while focus sits in an input, textarea, select, or contenteditable.
   * Defaults to `true` for combos carrying a modifier (⌘K should work while
   * typing) and `false` for bare keys (which would swallow ordinary typing).
   */
  enableOnFormElements?: boolean | undefined;
};

/**
 * Binds a global keyboard shortcut for as long as the component is mounted and
 * `enabled`. Pass `null`/`undefined` as the combo to bind nothing. Only the
 * winning registration for a combo runs, so overlapping bindings cannot both
 * fire on a single keypress.
 */
export function useHotkey(
  combo: string | null | undefined,
  handler: (event: KeyboardEvent) => void,
  options: UseHotkeyOptions = {},
): void {
  const id = useId();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const { enabled = true, priority = 0, enableOnFormElements } = options;

  useEffect(() => {
    if (!combo || !enabled) return;
    const parsed = parseHotkey(combo);

    ensureListener();
    registrations.push({
      id,
      combo: parsed,
      priority,
      enableOnFormElements: enableOnFormElements ?? parsed.mod,
      run: (event) => handlerRef.current(event),
    });

    return () => unregister(id);
  }, [combo, enabled, priority, enableOnFormElements, id]);
}
