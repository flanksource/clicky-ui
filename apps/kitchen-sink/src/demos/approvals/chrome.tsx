import type { ReactNode } from "react";
import {
  Icon,
  cn,
  type BadgeTone,
  type StaticIconComponent,
} from "@flanksource/clicky-ui";

/**
 * The handful of Merivio chrome primitives the approvals screens repeat:
 * `.badge`, `.chip`, `.dirchip`, `.count-badge`, `.kbd` and the card/section
 * class strings. Kept as literal Tailwind class strings so the JIT sees them.
 *
 * Tones stay on clicky-ui's `BadgeTone` vocabulary so the fixtures can keep
 * using one tone name across library components and this chrome.
 */

const BADGE_TONE: Record<BadgeTone, string> = {
  success: "bg-mv-accent-soft text-mv-positive",
  warning: "bg-mv-warm-soft text-mv-warm",
  danger: "bg-mv-negative-soft text-mv-negative",
  info: "bg-mv-info-soft text-mv-info",
  neutral: "border-mv-hair bg-mv-surface-2 text-mv-muted",
};

const MARK_TONE: Record<BadgeTone, string> = {
  success: "bg-mv-accent-soft text-mv-accent",
  warning: "bg-mv-warm-soft text-mv-warm",
  danger: "bg-mv-negative-soft text-mv-negative",
  info: "bg-mv-info-soft text-mv-info",
  neutral: "bg-mv-surface-2 text-mv-ink-3",
};

/** Merivio `.badge` — a pill with a leading dot in the current colour. */
export function MvBadge({
  tone,
  dot = true,
  children,
  className,
}: {
  tone: BadgeTone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] whitespace-nowrap rounded-full border border-transparent px-[9px] py-[2px] text-mv-xs font-medium",
        BADGE_TONE[tone],
        className,
      )}
    >
      {dot && <span className="size-[5px] shrink-0 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/** Merivio `.chip` — squared, hairline, second-surface. */
export function MvChip({
  children,
  mono,
  className,
}: {
  children: ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] whitespace-nowrap rounded-mv-sm border border-mv-hair bg-mv-surface-2 px-2 py-[2px] text-mv-xs text-mv-ink-3",
        mono && "font-mono",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Merivio `.dirchip` — the same chip, pill-shaped, with a muted glyph. */
export function MvDirChip({
  icon,
  children,
}: {
  icon: StaticIconComponent;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-[5px] whitespace-nowrap rounded-full border border-mv-hair bg-mv-surface-2 px-2 py-[2px] text-mv-xs text-mv-ink-3">
      <Icon icon={icon} className="text-mv-md text-mv-muted" />
      {children}
    </span>
  );
}

/** Merivio `.count-badge` — a bare tabular figure, no chrome at all. */
export function MvCount({ children }: { children: ReactNode }) {
  return (
    <span className="whitespace-nowrap font-mono text-mv-xs tabular-nums text-mv-muted">
      {children}
    </span>
  );
}

/**
 * Merivio `.kbd` — the shortcut hint inside a decision button. Drawn in the
 * button's own colour so one class string works on ink, paper and outline.
 */
export function MvKbd({ children }: { children: string }) {
  return (
    <kbd className="ml-0.5 rounded-[4px] border border-current px-[5px] py-px font-mono text-[10px] leading-4 opacity-50">
      {children}
    </kbd>
  );
}

/** Merivio `.apr-mark` / `.apl-icon` — the tinted glyph square. */
export function MvMark({
  icon,
  tone = "neutral",
  size = "sm",
  className,
}: {
  icon: StaticIconComponent;
  tone?: BadgeTone;
  size?: "sm" | "lg";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-mv-sm",
        MARK_TONE[tone],
        size === "lg" ? "size-10 rounded-mv-md text-[22px]" : "size-7 text-base",
        className,
      )}
    >
      <Icon icon={icon} />
    </span>
  );
}

/** `.apr-card` — white surface, 14px radius, the barely-there card shadow. */
export const MV_CARD =
  "overflow-hidden rounded-mv-lg border-mv-border bg-mv-surface shadow-mv-card";

/** `.primary-btn` — ink on paper, the only filled control on the page. */
export const MV_BTN_PRIMARY =
  "border-mv-ink bg-mv-ink text-mv-paper hover:bg-mv-ink-2 hover:text-mv-paper";

/** `.ghost-btn` — hairline outline on the surface. */
export const MV_BTN_GHOST =
  "border-mv-border bg-mv-surface text-mv-ink-2 hover:bg-mv-surface-2 hover:text-mv-ink";

/** `.danger-btn` — outline that warms to the negative wash on hover. */
export const MV_BTN_DANGER =
  "border-mv-border bg-mv-surface text-mv-ink-2 hover:border-mv-negative-soft hover:bg-mv-negative-soft hover:text-mv-negative";

/** `.apr-sechead` — 11px/18px header rule above a card body. */
export const MV_HEAD = "border-mv-border px-[18px] py-[11px]";

/** `.apr-secbody` — the 16px/18px body inset. */
export const MV_BODY = "px-[18px] py-4";

/** `.apr-eyebrow` — the tracked, uppercase micro-caption. */
export const MV_EYEBROW =
  "text-mv-eyebrow font-semibold uppercase text-mv-muted";

/** `.apr-fk` / `.apr-kvk` — the same caption used as a field key. */
export const MV_KEY =
  "text-mv-eyebrow font-semibold uppercase tracking-[0.08em] text-mv-muted";

/** Card header content: `EYEBROW · Title`, matching Merivio's `SecHead`. */
export function MvSecTitle({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title?: ReactNode;
}) {
  return (
    <span className="flex min-w-0 items-baseline gap-1.5">
      <span className={MV_EYEBROW}>{eyebrow}</span>
      {title !== undefined && (
        <>
          <span className="text-mv-muted-2">·</span>
          <span className="truncate text-mv-lg font-semibold text-mv-ink">
            {title}
          </span>
        </>
      )}
    </span>
  );
}
