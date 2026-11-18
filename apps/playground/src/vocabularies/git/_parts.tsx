import { cn } from "@flanksource/clicky-ui";
import { Icon } from "@flanksource/clicky-ui/data";

import { GIT_BRANCH_STATE, GIT_DIFF, GIT_TONE_SWATCH, GIT_TONE_TEXT, diffBlocks, type GitToken } from "./_theme";

/** A token's icon in its tone colour: the one way git glyphs are drawn. */
export function GitGlyph({ token, className }: { token: GitToken; className?: string }) {
  return <Icon icon={token.icon} className={cn("shrink-0", GIT_TONE_TEXT[token.tone], className)} />;
}

/** GitHub-style diff stat: +N green, -N red (a zero side is omitted), then the five square green / red / grey blocks. */
export function DiffStat({ adds, dels, bar = true }: { adds: number; dels: number; bar?: boolean }) {
  if (!adds && !dels) return null;
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tabular-nums" title={`${adds} additions, ${dels} deletions`}>
      {adds > 0 && <span className={GIT_TONE_TEXT[GIT_DIFF.additions.tone]}>+{adds}</span>}
      {dels > 0 && <span className={GIT_TONE_TEXT[GIT_DIFF.deletions.tone]}>-{dels}</span>}
      {bar && (
        <span aria-hidden className="inline-flex gap-px">
          {diffBlocks({ adds, dels }).map((tone, i) => (
            <span key={i} className={cn("inline-block size-2 rounded-[1px]", GIT_TONE_SWATCH[tone])} />
          ))}
        </span>
      )}
    </span>
  );
}

export function AheadBehind({ ahead, behind, base, className }: { ahead: number; behind: number; base: string; className?: string }) {
  if (ahead === 0 && behind === 0) {
    return <span className={cn("text-[11px] text-muted-foreground", className)}>even with {base}</span>;
  }
  return (
    <span
      title={`${ahead} ahead, ${behind} behind ${base}`}
      className={cn("inline-flex items-center gap-1.5 rounded-full border border-border px-1.5 py-px font-mono text-[11px] tabular-nums", className)}
    >
      <span className={cn("inline-flex items-center", GIT_TONE_TEXT[ahead ? GIT_BRANCH_STATE.ahead.tone : "neutral"])}>
        <Icon icon={GIT_BRANCH_STATE.ahead.icon} className="text-[10px]" />
        {ahead}
      </span>
      <span className={cn("inline-flex items-center", GIT_TONE_TEXT[behind ? GIT_BRANCH_STATE.behind.tone : "neutral"])}>
        <Icon icon={GIT_BRANCH_STATE.behind.icon} className="text-[10px]" />
        {behind}
      </span>
    </span>
  );
}
