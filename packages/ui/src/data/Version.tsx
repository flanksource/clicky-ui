import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { Badge, type BadgeTone } from "./Badge";
import { getVersionInfo, type RuntimeMode, type VersionInfo } from "./version-info";

export type VersionProps = HTMLAttributes<HTMLSpanElement> & {
  /** Show the short git commit hash. */
  commit?: boolean;
  /** Show the git tag. */
  tag?: boolean;
  /** Show the build date. */
  date?: boolean;
  /**
   * Override the resolved build/runtime info. Primarily for stories and tests;
   * when omitted the values injected at build time are used.
   */
  info?: Partial<VersionInfo>;
};

const MODE_BADGE: Record<Exclude<RuntimeMode, "production">, { label: string; tone: BadgeTone }> = {
  dev: { label: "dev", tone: "info" },
  storybook: { label: "storybook", tone: "neutral" },
};

function formatDate(iso: string): string {
  if (!iso) return "";
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? iso : parsed.toISOString();
}

/**
 * Renders clicky-ui build metadata: git commit, tag, and build date, plus a
 * status badge for a dirty working tree, Vite dev mode, or Storybook.
 *
 * Commit/tag/date/dirty are captured when the library is built (Vite `define`);
 * `dev` and `storybook` are detected at runtime.
 */
export const Version = forwardRef<HTMLSpanElement, VersionProps>(
  ({ commit = true, tag = true, date = true, info, className, ...props }, ref) => {
    const resolved = { ...getVersionInfo(), ...info };

    const parts: string[] = [];
    if (tag && resolved.tag) parts.push(resolved.tag);
    if (commit && resolved.commit) parts.push(resolved.commit);
    if (date && resolved.date) parts.push(formatDate(resolved.date));

    const mode = resolved.mode !== "production" ? MODE_BADGE[resolved.mode] : null;

    return (
      <span
        ref={ref}
        className={cn("inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground", className)}
        {...props}
      >
        {parts.length > 0 && <span>{parts.join(" · ")}</span>}
        {resolved.dirty && (
          <Badge tone="warning" variant="soft" size="xs">
            dirty
          </Badge>
        )}
        {mode && (
          <Badge tone={mode.tone} variant="soft" size="xs">
            {mode.label}
          </Badge>
        )}
      </span>
    );
  },
);

Version.displayName = "Version";
