import type { ReactNode } from "react";
import { Icon } from "../../Icon";
import { UiGitBranch } from "../../../icons";

// Spec header (design .rail header): eyebrow, title, and an optional target
// chip. Sits above the stacked sections; the per-section nav has been dropped
// now that each section carries its own collapsible header.
export function Rail({
  eyebrow,
  title,
  target,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  target?: string | undefined;
}) {
  return (
    <header className="mb-density-4 border-b border-border pb-density-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {eyebrow}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-density-3">
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        {target && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-density-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            <Icon icon={UiGitBranch} className="size-3.5" />
            {target}
          </span>
        )}
      </div>
    </header>
  );
}
