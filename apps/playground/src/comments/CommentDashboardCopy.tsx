import { useState } from "react";
import { SplitButton } from "@flanksource/clicky-ui";
import { writeClipboard } from "./clipboard";
import { dashboardCopy } from "./dashboard-copy";
import type { DashboardState } from "./dashboard-state";
import type { PageComment } from "./useComments";

export function CommentDashboardCopy({
  comments,
  selected,
  state,
}: {
  comments: PageComment[];
  selected: PageComment[];
  state: DashboardState;
}) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function copy(target: "LLM" | "Claude" | "Codex") {
    try {
      await writeClipboard(
        Promise.resolve().then(() =>
          dashboardCopy({
            comments,
            selected,
            state,
            target,
            url: window.location.href,
          }),
        ),
      );
      setError(null);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }
  return (
    <div className="space-y-1">
      <SplitButton
        label={copied ? "Copied" : "Copy for LLM"}
        size="sm"
        variant="outline"
        title="Copy agent instructions"
        onClick={() => void copy("LLM")}
        items={[
          { label: "Copy for Claude", onSelect: () => void copy("Claude") },
          { label: "Copy for Codex", onSelect: () => void copy("Codex") },
        ]}
      />
      {error && (
        <p role="alert" className="max-w-72 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
