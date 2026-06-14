import { createContext, useContext, type ReactNode } from "react";
import type { BadgeTone } from "../data/Badge";

export type ToastTone = BadgeTone;

export type ToastOptions = {
  /** Message body. */
  message: ReactNode;
  /** Semantic color of the leading dot. Defaults to `neutral`. */
  tone?: ToastTone;
  /** Auto-dismiss delay in ms. `0` keeps it until dismissed. */
  durationMs?: number;
};

export type ToastEntry = ToastOptions & { id: number };

export type ToastContextValue = {
  /** Show a toast; returns its id. Pass a string for a neutral message. */
  toast: (options: ToastOptions | string) => number;
  /** Dismiss a toast by id. */
  dismiss: (id: number) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

/** Access the toast API. Must be called under a `<ToastProvider>`. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a <ToastProvider>");
  return ctx;
}
