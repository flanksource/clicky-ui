import type { SessionTone } from "./SessionViewer.model";

/**
 * `SessionTone` → the class bundles consumers need to render one.
 *
 * The tones themselves are assigned by the Agent Action Icons set
 * (`WORKFLOW_PHASES`, `EFFORT_ICONS`, `AGENT_RUNTIME_ICONS`) and by the session
 * viewer's own per-tool `ACTIONS` map. Those give a caller a tone *name*; this
 * turns it into classes, so a "plan" chip in an app header and a plan row in
 * `SessionViewer` are visibly the same thing rather than two guesses at sky.
 *
 * Two treatments, because they are not interchangeable:
 *
 * - `text` is a glyph on the page background, and pairs `-700` light with
 *   `-400` dark. This is what `EFFORT_LEVEL_COLOR` uses for the same job.
 * - `disc` is a filled circle or chip, and pairs a `-100` / `-500/15` fill with
 *   `-700` / `-300` text. The lighter `-300` is legible *on that fill* and reads
 *   washed out without it, which is why `text` does not simply reuse it.
 *
 * Every class is a literal so Tailwind's scanner sees it, and dark mode keys off
 * the `data-theme` attribute rather than the `dark:` variant — the same rules
 * `EFFORT_LEVEL_COLOR` already follows.
 */
export interface SessionToneClasses {
  /** Glyph colour on the page background. */
  text: string;
  /** Filled disc or chip: background plus its own legible foreground. */
  disc: string;
  /** Border colour, for outlined chips and nodes. */
  border: string;
}

export const SESSION_TONES: Record<SessionTone, SessionToneClasses> = {
  sky: {
    text: "text-sky-700 [[data-theme=dark]_&]:text-sky-400",
    disc: "bg-sky-100 text-sky-700 [[data-theme=dark]_&]:bg-sky-500/15 [[data-theme=dark]_&]:text-sky-300",
    border: "border-sky-500 [[data-theme=dark]_&]:border-sky-400",
  },
  amber: {
    text: "text-amber-700 [[data-theme=dark]_&]:text-amber-400",
    disc: "bg-amber-100 text-amber-700 [[data-theme=dark]_&]:bg-amber-500/15 [[data-theme=dark]_&]:text-amber-300",
    border: "border-amber-500 [[data-theme=dark]_&]:border-amber-400",
  },
  violet: {
    text: "text-violet-700 [[data-theme=dark]_&]:text-violet-400",
    disc: "bg-violet-100 text-violet-700 [[data-theme=dark]_&]:bg-violet-500/15 [[data-theme=dark]_&]:text-violet-300",
    border: "border-violet-500 [[data-theme=dark]_&]:border-violet-400",
  },
  emerald: {
    text: "text-emerald-700 [[data-theme=dark]_&]:text-emerald-400",
    disc: "bg-emerald-100 text-emerald-700 [[data-theme=dark]_&]:bg-emerald-500/15 [[data-theme=dark]_&]:text-emerald-300",
    border: "border-emerald-500 [[data-theme=dark]_&]:border-emerald-400",
  },
  teal: {
    text: "text-teal-700 [[data-theme=dark]_&]:text-teal-400",
    disc: "bg-teal-100 text-teal-700 [[data-theme=dark]_&]:bg-teal-500/15 [[data-theme=dark]_&]:text-teal-300",
    border: "border-teal-500 [[data-theme=dark]_&]:border-teal-400",
  },
  orange: {
    text: "text-orange-700 [[data-theme=dark]_&]:text-orange-400",
    disc: "bg-orange-100 text-orange-700 [[data-theme=dark]_&]:bg-orange-500/15 [[data-theme=dark]_&]:text-orange-300",
    border: "border-orange-500 [[data-theme=dark]_&]:border-orange-400",
  },
  rose: {
    text: "text-rose-700 [[data-theme=dark]_&]:text-rose-400",
    disc: "bg-rose-100 text-rose-700 [[data-theme=dark]_&]:bg-rose-500/15 [[data-theme=dark]_&]:text-rose-300",
    border: "border-rose-500 [[data-theme=dark]_&]:border-rose-400",
  },
  indigo: {
    text: "text-indigo-700 [[data-theme=dark]_&]:text-indigo-400",
    disc: "bg-indigo-100 text-indigo-700 [[data-theme=dark]_&]:bg-indigo-500/15 [[data-theme=dark]_&]:text-indigo-300",
    border: "border-indigo-500 [[data-theme=dark]_&]:border-indigo-400",
  },
  fuchsia: {
    text: "text-fuchsia-700 [[data-theme=dark]_&]:text-fuchsia-400",
    disc: "bg-fuchsia-100 text-fuchsia-700 [[data-theme=dark]_&]:bg-fuchsia-500/15 [[data-theme=dark]_&]:text-fuchsia-300",
    border: "border-fuchsia-500 [[data-theme=dark]_&]:border-fuchsia-400",
  },
  pink: {
    text: "text-pink-700 [[data-theme=dark]_&]:text-pink-400",
    disc: "bg-pink-100 text-pink-700 [[data-theme=dark]_&]:bg-pink-500/15 [[data-theme=dark]_&]:text-pink-300",
    border: "border-pink-500 [[data-theme=dark]_&]:border-pink-400",
  },
  slate: {
    // Slate is the "no particular category" tone, so it uses the theme's own
    // neutral tokens rather than a fixed grey that would fight the surface.
    text: "text-muted-foreground",
    disc: "bg-muted text-muted-foreground",
    border: "border-border",
  },
};

/** Class bundle for a tone. */
export function sessionTone(tone: SessionTone): SessionToneClasses {
  return SESSION_TONES[tone];
}
