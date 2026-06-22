import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/utils";
import { useFloatingZIndex } from "../overlay/modalStack";
import { CommentAuthorAvatar } from "./CommentAuthor";
import type { CommentMention, CommentMentionable } from "./comment-types";

export type MentionTextareaProps = {
  /** Controlled value. */
  value: string;
  /** Called with the next value on edit or mention insertion. */
  onChange: (value: string) => void;
  /** People/agents offered in the @-mention popover. */
  mentionables: CommentMentionable[];
  /** Fired when a mention is inserted via the popover. */
  onMentionSelect?: (mention: CommentMention) => void;
  /** Enter (without Shift) while the popover is closed. */
  onSubmit?: () => void;
  /** Escape while the popover is closed. */
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  rows?: number;
  className?: string;
  "data-testid"?: string;
};

const MENTION_QUERY = /(^|\s)@([\w.-]*)$/;
const MAX_RESULTS = 8;

type ActiveMention = { atIndex: number; query: string };
type CaretRect = { top: number; left: number; height: number };

function detectMention(value: string, caret: number): ActiveMention | null {
  const match = value.slice(0, caret).match(MENTION_QUERY);
  if (!match) return null;
  const query = match[2] ?? "";
  const atIndex = caret - query.length - 1;
  return { atIndex, query };
}

function filterMentionables(
  mentionables: CommentMentionable[],
  query: string,
): CommentMentionable[] {
  const q = query.toLowerCase();
  const matches = q
    ? mentionables.filter(
        (m) =>
          m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q),
      )
    : mentionables;
  return matches.slice(0, MAX_RESULTS);
}

const MIRROR_PROPS = [
  "boxSizing",
  "width",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "fontStyle",
  "fontVariant",
  "fontWeight",
  "fontStretch",
  "fontSize",
  "lineHeight",
  "fontFamily",
  "textAlign",
  "textTransform",
  "textIndent",
  "letterSpacing",
  "wordSpacing",
  "tabSize",
  "whiteSpace",
  "wordWrap",
  "overflowWrap",
] as const;

// Measures the caret pixel position with an off-screen mirror div that copies the
// textarea's box metrics — the dependency-free way to anchor a popover at the caret.
function caretViewportRect(
  el: HTMLTextAreaElement,
  position: number,
): CaretRect {
  if (
    typeof document === "undefined" ||
    typeof getComputedStyle !== "function"
  ) {
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, height: 16 };
  }
  const style = getComputedStyle(el);
  const mirror = document.createElement("div");
  for (const prop of MIRROR_PROPS) mirror.style[prop] = style[prop];
  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.overflowWrap = "break-word";
  mirror.style.top = "0";
  mirror.style.left = "-9999px";
  mirror.textContent = el.value.slice(0, position);

  const marker = document.createElement("span");
  marker.textContent = el.value.slice(position) || ".";
  mirror.appendChild(marker);
  document.body.appendChild(mirror);

  const lineHeight =
    parseInt(style.lineHeight, 10) || parseInt(style.fontSize, 10) || 16;
  const offsetTop = marker.offsetTop;
  const offsetLeft = marker.offsetLeft;
  document.body.removeChild(mirror);

  const rect = el.getBoundingClientRect();
  return {
    top: rect.top + offsetTop - el.scrollTop,
    left: rect.left + offsetLeft - el.scrollLeft,
    height: lineHeight,
  };
}

/**
 * A textarea with an @-mention autocomplete. Typing `@` opens a caret-anchored
 * popover filtered against `mentionables`; selecting one inserts the name and
 * fires `onMentionSelect`. Enter submits and Escape cancels only when the
 * popover is closed.
 */
export const MentionTextarea = forwardRef<
  HTMLTextAreaElement,
  MentionTextareaProps
>(function MentionTextarea(
  {
    value,
    onChange,
    mentionables,
    onMentionSelect,
    onSubmit,
    onCancel,
    placeholder,
    autoFocus,
    rows = 2,
    className,
    "data-testid": dataTestId,
  },
  forwardedRef,
) {
  const innerRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(
    forwardedRef,
    () => innerRef.current as HTMLTextAreaElement,
  );

  const [active, setActive] = useState<ActiveMention | null>(null);
  const [caretRect, setCaretRect] = useState<CaretRect | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const floatingZ = useFloatingZIndex();

  const results = active ? filterMentionables(mentionables, active.query) : [];
  const open = active != null && results.length > 0;

  function refreshMention(el: HTMLTextAreaElement) {
    const next = detectMention(el.value, el.selectionStart ?? el.value.length);
    setActive(next);
    setActiveIndex(0);
    setCaretRect(next ? caretViewportRect(el, el.selectionStart ?? 0) : null);
  }

  function insertMention(m: CommentMentionable) {
    const el = innerRef.current;
    if (!el || !active) return;
    const caret = el.selectionStart ?? value.length;
    const next = `${value.slice(0, active.atIndex)}@${m.name} ${value.slice(caret)}`;
    const nextCaret = active.atIndex + m.name.length + 2;
    onChange(next);
    onMentionSelect?.({ id: m.id, name: m.name, kind: m.kind });
    setActive(null);
    setCaretRect(null);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(nextCaret, nextCaret);
    });
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (open) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % results.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + results.length) % results.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const choice = results[activeIndex];
        if (choice) insertMention(choice);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setActive(null);
        setCaretRect(null);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit?.();
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel?.();
    }
  }

  useEffect(() => {
    if (!autoFocus) return;
    const el = innerRef.current;
    const raf = requestAnimationFrame(() => {
      el?.focus();
      const len = el?.value.length ?? 0;
      el?.setSelectionRange(len, len);
    });
    return () => cancelAnimationFrame(raf);
  }, [autoFocus]);

  return (
    <>
      <textarea
        ref={innerRef}
        rows={rows}
        value={value}
        placeholder={placeholder}
        data-testid={dataTestId}
        className={cn(
          "w-full resize-none bg-transparent text-sm leading-snug outline-none placeholder:text-muted-foreground/60",
          className,
        )}
        onChange={(e) => {
          onChange(e.target.value);
          refreshMention(e.target);
        }}
        onKeyUp={(e) => refreshMention(e.currentTarget)}
        onClick={(e) => refreshMention(e.currentTarget)}
        onKeyDown={onKeyDown}
        onBlur={() => {
          setActive(null);
          setCaretRect(null);
        }}
      />
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <ul
            role="listbox"
            data-testid="mention-popover"
            style={{
              position: "fixed",
              top: (caretRect?.top ?? 0) + (caretRect?.height ?? 16) + 2,
              left: caretRect?.left ?? 0,
              zIndex: floatingZ,
            }}
            className="max-h-56 min-w-[12rem] overflow-auto rounded-md border border-border bg-popover py-1 shadow-md"
          >
            {results.map((m, i) => (
              <li key={m.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === activeIndex}
                  // Use mousedown so selection runs before the textarea blur closes the popover.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    insertMention(m);
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-popover-foreground",
                    i === activeIndex && "bg-accent text-accent-foreground",
                  )}
                >
                  <CommentAuthorAvatar
                    author={{
                      name: m.name,
                      kind: m.kind,
                      ...(m.avatar ? { avatar: m.avatar } : {}),
                      ...(m.icon ? { icon: m.icon } : {}),
                    }}
                    size="xs"
                    bare
                  />
                  <span className="truncate">{m.name}</span>
                  {m.kind === "agent" && (
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      agent
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </>
  );
});
