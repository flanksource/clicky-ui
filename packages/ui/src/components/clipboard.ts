import { useCallback, useEffect, useRef, useState } from "react";

export type CopyFlashState = "idle" | "pending" | "copied" | "error";

/** Rich text for the clipboard: `html` pastes formatted, `text` is the plain alternative. */
export type RichClipboardPayload = { text: string; html: string };

/** Plain text that is still loading, copied as a `text/plain`-only ClipboardItem. */
export type PendingTextPayload = { plain: Promise<string> };

/** What `useCopyFlash().copy` accepts: plain text (possibly still loading), or a rich payload that may still be loading. */
export type CopyFlashPayload =
  | string
  | PendingTextPayload
  | RichClipboardPayload
  | Promise<RichClipboardPayload>;

function richBlob(
  payload: Promise<RichClipboardPayload>,
  type: "text/html" | "text/plain",
  pick: (payload: RichClipboardPayload) => unknown,
): Promise<Blob> {
  return payload.then((resolved) => {
    const value = pick(resolved);
    if (typeof value !== "string") {
      throw new Error(`Rich copy payload has no ${type === "text/html" ? "html" : "text"} string`);
    }
    return new Blob([value], { type });
  });
}

/**
 * copyRich writes `payload` as one ClipboardItem carrying both `text/html` and
 * `text/plain`. The item is built from Promise<Blob>s and written before the
 * payload settles, so a payload fetched from the server after the click still
 * counts as inside the user gesture (Safari and Chrome both require that).
 * Rejects when the browser lacks ClipboardItem or `navigator.clipboard.write`,
 * or when the payload rejects — never degrading to a text-only copy.
 */
export async function copyRich(
  payload: Promise<RichClipboardPayload> | RichClipboardPayload,
): Promise<void> {
  const pending = Promise.resolve(payload);
  await writeClipboardItem("Rich copy", {
    "text/html": richBlob(pending, "text/html", (resolved) => resolved.html),
    "text/plain": richBlob(pending, "text/plain", (resolved) => resolved.text),
  });
}

/**
 * copyPendingText writes text that is still loading as a `text/plain`-only
 * ClipboardItem, started before the text settles so it stays inside the user
 * gesture. `copyText` cannot: awaiting the text first would leave the gesture.
 * Rejects when the browser lacks ClipboardItem or `navigator.clipboard.write`,
 * or when the text rejects or is not a string.
 */
export async function copyPendingText(text: Promise<string>): Promise<void> {
  await writeClipboardItem("Text copy", {
    "text/plain": text.then((value) => {
      if (typeof value !== "string") throw new Error("Text copy payload is not a string");
      return new Blob([value], { type: "text/plain" });
    }),
  });
}

async function writeClipboardItem(what: string, blobs: Record<string, Promise<Blob>>): Promise<void> {
  if (typeof ClipboardItem === "undefined") {
    throw new Error(`${what} is unsupported: this browser has no ClipboardItem`);
  }
  if (typeof navigator === "undefined" || typeof navigator.clipboard?.write !== "function") {
    throw new Error(
      `${what} is unsupported: navigator.clipboard.write is unavailable (insecure origin or blocked by the host)`,
    );
  }
  // The browser may stop reading the item after the first rejected blob; the
  // rejection still reaches the caller through the Promise.all below.
  for (const blob of Object.values(blobs)) blob.catch(() => undefined);
  await navigator.clipboard.write([new ClipboardItem(blobs)]);
  await Promise.all(Object.values(blobs));
}

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
 * Drives a copy affordance's transient feedback. `copy(text)` writes plain text
 * and flips `state` to `copied`/`error`, reverting after `resetMs`. `copy` with
 * `{ plain: Promise<string> }` goes through `copyPendingText`, and with a rich
 * payload (or a promise of one) through `copyRich`; both keep `state`
 * `pending` until the clipboard write settles, then `copied`/`error`, reverting
 * after `resetMs`. Only the latest copy updates `state`, and nothing does once
 * the component unmounts.
 */
export function useCopyFlash(resetMs = 1500): {
  state: CopyFlashState;
  copy: (payload: CopyFlashPayload) => void;
} {
  const [state, setState] = useState<CopyFlashState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(0);

  useEffect(
    () => () => {
      latest.current += 1;
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );

  const scheduleReset = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      setState("idle");
    }, resetMs);
  }, [resetMs]);

  const copy = useCallback(
    (payload: CopyFlashPayload) => {
      const id = ++latest.current;
      if (typeof payload === "string") {
        void copyText(payload).then(
          () => id === latest.current && setState("copied"),
          () => id === latest.current && setState("error"),
        );
        scheduleReset();
        return;
      }
      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = null;
      setState("pending");
      const settle = (next: CopyFlashState) => {
        if (id !== latest.current) return;
        setState(next);
        scheduleReset();
      };
      const write = "plain" in payload ? copyPendingText(payload.plain) : copyRich(payload);
      void write.then(
        () => settle("copied"),
        () => settle("error"),
      );
    },
    [scheduleReset],
  );

  return { state, copy };
}
