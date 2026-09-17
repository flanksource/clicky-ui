import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ConfirmDialog, type ConfirmOptions } from "./ConfirmDialog";
import { forgetConfirm, isConfirmRemembered, subscribeConfirmMemory } from "./confirmMemory";

type PendingConfirm = { options: ConfirmOptions; resolve: (confirmed: boolean) => void };

/**
 * Promise-returning confirmation, for call sites that need an answer inline —
 * a `beforeRun` hook, a guard before a mutation. Render `dialog` once.
 */
export function useConfirm(): {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  dialog: ReactNode;
} {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const pendingRef = useRef<PendingConfirm | null>(null);

  useEffect(() => () => pendingRef.current?.resolve(false), []);

  const confirm = useCallback((options: ConfirmOptions) => {
    if (options.remember && isConfirmRemembered(options.remember.key)) return Promise.resolve(true);
    // A newer request supersedes one still on screen.
    pendingRef.current?.resolve(false);
    return new Promise<boolean>((resolve) => {
      const next = { options, resolve };
      pendingRef.current = next;
      setPending(next);
    });
  }, []);

  const settle = (confirmed: boolean) => {
    pendingRef.current = null;
    setPending(null);
    pending?.resolve(confirmed);
  };

  const dialog = pending ? (
    <ConfirmDialog {...pending.options} open onConfirm={() => settle(true)} onCancel={() => settle(false)} />
  ) : null;
  return { confirm, dialog };
}

/**
 * Whether `key` holds a remembered confirmation, live, and a way to clear it —
 * for the "you will not be asked" banner a remembered choice owes the user.
 */
export function useConfirmMemory(key: string | undefined): { remembered: boolean; forget: () => void } {
  const remembered = useSyncExternalStore(
    subscribeConfirmMemory,
    () => key !== undefined && isConfirmRemembered(key),
    () => false,
  );
  const forget = useCallback(() => {
    if (key !== undefined) forgetConfirm(key);
  }, [key]);
  return { remembered, forget };
}
