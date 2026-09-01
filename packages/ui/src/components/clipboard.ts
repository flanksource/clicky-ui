import { useCallback, useEffect, useRef, useState } from "react";

export type CopyFlashState = "idle" | "copied" | "error";

// copyText writes text to the clipboard, falling back to a hidden-textarea
// execCommand("copy") when the async Clipboard API is unavailable or rejects —
// an insecure (http) origin, or an embedded WebView where writeText is denied.
// Rejects when both paths fail so callers can surface the failure instead of a
// copy button that silently does nothing.
export async function copyText(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the user-gesture copy path below.
    }
  }
  // execCommand is absent in jsdom and deprecated in browsers, so treat a
  // missing one as a rejection rather than letting a TypeError escape.
  if (typeof document === "undefined" || typeof document.execCommand !== "function") {
    throw new Error("Browser rejected the copy request");
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  } finally {
    document.body.removeChild(textarea);
  }
  if (!copied) throw new Error("Browser rejected the copy request");
}

/**
 * Drives a copy affordance's transient feedback: `copy(text)` writes to the
 * clipboard and flips `state` to `copied`/`error`, reverting after `resetMs`.
 * The pending timer is cleared on unmount so it never sets state after the
 * component is gone.
 */
export function useCopyFlash(resetMs = 1500): {
  state: CopyFlashState;
  copy: (text: string) => void;
} {
  const [state, setState] = useState<CopyFlashState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(
    (text: string) => {
      void copyText(text).then(
        () => setState("copied"),
        () => setState("error"),
      );
      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        setState("idle");
      }, resetMs);
    },
    [resetMs],
  );

  return { state, copy };
}
