import { useEffect, useRef, useState } from "react";
import { SplitButton } from "../../components/SplitButton";
import { writeClipboard } from "./clipboard";
import type { InboxFilters, InboxItem } from "./inbox-model";
import { inboxPrompt, type InboxPromptTarget } from "./inbox-prompt";

const COPIED_MS = 1500;

/** Copies agent instructions for the inbox's current selection, for an LLM, Claude or Codex. */
export function CommentInboxCopy({ items, scopes, filters, baseUrl }: { items: readonly InboxItem[]; scopes: readonly string[]; filters: InboxFilters; baseUrl: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy(target: InboxPromptTarget) {
    try {
      // The clipboard write starts inside the click; the prompt is built while it is pending.
      await writeClipboard(Promise.resolve().then(() => inboxPrompt({ items, scopes, filters, target, baseUrl, url: window.location.href })));
      setError(null);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
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
