import { cn } from "../../lib/utils";

const MAX_BARS = 5;

export type DiffStatProps = {
  /** Lines added. */
  additions: number;
  /** Lines removed. */
  deletions: number;
  /** Changed file count, shown before the line counts when set. */
  files?: number;
  /** Show the GitHub-style five-block proportion bar. Defaults to true. */
  bars?: boolean;
  className?: string;
};

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/** Compact `+adds -dels` line-change summary with an optional proportion bar —
 *  the same stat GitFileList shows per file. */
export function DiffStat({
  additions,
  deletions,
  files,
  bars = true,
  className,
}: DiffStatProps) {
  const total = additions + deletions;
  const addBars = total > 0 ? Math.round((additions / total) * MAX_BARS) : 0;
  const label = [
    files !== undefined ? plural(files, "changed file") : undefined,
    plural(additions, "addition"),
    plural(deletions, "deletion"),
  ]
    .filter(Boolean)
    .join(", ");
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap tabular-nums",
        className,
      )}
    >
      {files !== undefined && (
        <span aria-hidden className="text-muted-foreground">
          {files}
        </span>
      )}
      <span aria-hidden className="text-emerald-600 dark:text-emerald-400">
        +{additions}
      </span>
      <span aria-hidden className="text-rose-600 dark:text-rose-400">
        -{deletions}
      </span>
      {bars && (
        <span className="inline-flex gap-px" aria-hidden>
          {Array.from({ length: total === 0 ? 1 : MAX_BARS }, (_, index) => {
            const tone =
              total === 0 ? "empty" : index < addBars ? "add" : "del";
            return (
              <span
                key={index}
                data-diff-bar={tone}
                className={cn(
                  "inline-block h-2 w-1.5 rounded-sm",
                  tone === "add" && "bg-emerald-500",
                  tone === "del" && "bg-rose-500",
                  tone === "empty" && "bg-muted-foreground/30",
                )}
              />
            );
          })}
        </span>
      )}
    </span>
  );
}
