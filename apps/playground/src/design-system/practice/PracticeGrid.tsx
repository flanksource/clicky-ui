import { cn } from "@flanksource/clicky-ui";
import { UiCheck, UiLightbulb, UiProhibit } from "@flanksource/clicky-ui/icons";

import { useAnnotationsHidden } from "../../annotations";

// The prose version of the same idea as AnnotatedSpecimen: a practice reads as a
// ruling, not as another paragraph. Tone is carried by an edge and a glyph so a
// "do" and a "never" can sit in one grid and still be told apart at a glance.

export type PracticeTone = "do" | "avoid" | "rule";

export type Practice = {
  title: string;
  body: string;
  tone?: PracticeTone;
};

const TONE_STYLE: Record<PracticeTone, { edge: string; chip: string; label: string }> = {
  do: {
    edge: "border-l-emerald-500",
    chip: "bg-emerald-500/10 text-emerald-700 [[data-theme=dark]_&]:text-emerald-300",
    label: "Do",
  },
  avoid: {
    edge: "border-l-rose-500",
    chip: "bg-rose-500/10 text-rose-700 [[data-theme=dark]_&]:text-rose-300",
    label: "Never",
  },
  rule: {
    edge: "border-l-primary",
    chip: "bg-primary/10 text-primary",
    label: "Rule",
  },
};

const TONE_ICON = { do: UiCheck, avoid: UiProhibit, rule: UiLightbulb } as const;

export function PracticeGrid({
  practices,
  className,
}: {
  practices: readonly Practice[];
  className?: string;
}) {
  const annotationsHidden = useAnnotationsHidden();
  if (annotationsHidden) return <span hidden data-playground-annotation-only />;

  return (
    <div className={cn("grid gap-density-3 md:grid-cols-2 xl:grid-cols-3", className)}>
      {practices.map((practice) => {
        const tone = practice.tone ?? "rule";
        const style = TONE_STYLE[tone];
        const Icon = TONE_ICON[tone];
        return (
          <article
            key={practice.title}
            className={cn("rounded-xl border border-l-4 border-border bg-card p-density-3", style.edge)}
          >
            <div className="flex items-center gap-density-2">
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", style.chip)}>
                <Icon className="size-3" />
                {style.label}
              </span>
            </div>
            <h3 className="mt-density-2 text-sm font-semibold text-foreground">{practice.title}</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{practice.body}</p>
          </article>
        );
      })}
    </div>
  );
}
