import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { zIndex } from "./zIndex";

// A process-wide stack of the currently open modals, topmost last. Modals mount
// independently (no shared provider), so the stack lives at module scope and is
// shared through useSyncExternalStore. It lets nested modals cooperate: only the
// topmost reacts to Escape, and each renders above the one it opened over.
const stack: string[] = [];
const listeners = new Set<() => void>();
const escapeStack: Array<{ id: string; onEscape: () => void }> = [];
let escapeDocument: Document | null = null;
// Running guided tours. A tour dims the page from `zIndex.tour`, far above the
// modal band, so floating content opened *during* a tour (the menu a step tells
// the user to open) has to clear that dim or it renders invisibly underneath.
let tourLayers = 0;

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// The snapshot is the stack identity plus the tour-layer count; it only changes
// when an entry is pushed or popped, so subscribers re-render exactly when their
// position could have moved.
function getSnapshot() {
  return `${tourLayers}:` + stack.join("\u0000");
}

function onEscapeKeyDown(event: KeyboardEvent) {
  if (
    event.defaultPrevented ||
    event.key !== "Escape" ||
    event.isComposing ||
    (event as KeyboardEvent & { keyCode?: number }).keyCode === 229
  ) {
    return;
  }

  const top = escapeStack[escapeStack.length - 1];
  if (!top) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  top.onEscape();
}

function ensureEscapeListener() {
  if (escapeDocument || typeof document === "undefined") return;
  escapeDocument = document;
  escapeDocument.addEventListener("keydown", onEscapeKeyDown);
}

function removeEscapeLayer(id: string) {
  const index = escapeStack.findIndex((entry) => entry.id === id);
  if (index !== -1) escapeStack.splice(index, 1);

  if (escapeStack.length === 0 && escapeDocument) {
    escapeDocument.removeEventListener("keydown", onEscapeKeyDown);
    escapeDocument = null;
  }
}

export type ModalStackPosition = {
  /** Whether this modal is the topmost open one and should own global affordances. */
  isTop: boolean;
  /** Zero-based depth in the stack; drives the stacking order of nested modals. */
  depth: number;
};

/**
 * Registers a modal in the global stack while `open`, returning its live
 * position. Used so a nested modal sits above its opener and only the topmost
 * modal closes on Escape.
 */
export function useModalStack(open: boolean): ModalStackPosition {
  const id = useId();
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!open) return;
    stack.push(id);
    emit();
    return () => {
      const index = stack.indexOf(id);
      if (index !== -1) stack.splice(index, 1);
      emit();
    };
  }, [open, id]);

  const depth = stack.indexOf(id);
  return {
    isTop: depth !== -1 && depth === stack.length - 1,
    depth: depth === -1 ? 0 : depth,
  };
}

/**
 * Registers an Escape-closeable overlay while `open`. The topmost registered
 * layer owns Escape, so a keypress dismisses one dialog/menu layer at a time.
 */
export function useEscapeLayer(open: boolean, onEscape: () => void, enabled = true) {
  const id = useId();
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    if (!open || !enabled) return;

    ensureEscapeListener();
    escapeStack.push({
      id,
      onEscape: () => onEscapeRef.current(),
    });

    return () => removeEscapeLayer(id);
  }, [enabled, id, open]);
}

/**
 * Registers a running guided tour while `active`, so floating layers lift above
 * its dim. Symmetric with `useModalStack`, but a count rather than a stack: the
 * tour overlay does not nest.
 */
export function useTourLayer(active: boolean): void {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!active) return;
    tourLayers += 1;
    emit();
    return () => {
      tourLayers -= 1;
      emit();
    };
  }, [active]);
}

/**
 * z-index a floating layer (dropdown / combobox / tooltip / popover) should use
 * so it renders above any open modal — and below the next nested modal — or at
 * the popover floor when no modal is open. While a guided tour runs, the value
 * also clears the tour's dim and step card, so a step that says "open this menu"
 * shows the menu rather than hiding it under the overlay. Subscribes to the
 * modal stack so the value tracks modals and tours opening and closing.
 */
export function useFloatingZIndex(): number {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const base =
    stack.length === 0
      ? zIndex.popover
      : zIndex.modal + (stack.length - 1) * zIndex.modalStep + zIndex.popoverOverModalOffset;
  if (tourLayers === 0) return base;
  return Math.max(base, zIndex.tour + zIndex.tourCardOffset + zIndex.popoverOverModalOffset);
}
