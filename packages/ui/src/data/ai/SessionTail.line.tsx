import { Icon } from "../Icon";
import { UiSparkles } from "../../icons";
import { CATEGORY_ICONS, classifyToolCategory } from "./session-categories";
import type { TailLatest } from "./SessionTail.model";

function ToolLine({ latest }: { latest: TailLatest }) {
  const tool = latest.tool ?? "";
  const category = latest.category ?? classifyToolCategory(tool);
  return (
    <span
      data-testid="session-tail-tool"
      title={latest.text ? `${tool} ${latest.text}` : tool}
      className="flex min-w-0 items-center gap-1.5"
    >
      <Icon icon={CATEGORY_ICONS[category]} className="size-3.5 shrink-0" />
      <span className="shrink-0 font-medium text-foreground">{tool}</span>
      {latest.text && <span className="min-w-0 truncate font-mono">{latest.text}</span>}
    </span>
  );
}

function TextLine({ text }: { text: string }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <Icon icon={UiSparkles} className="size-3.5 shrink-0" />
      <span data-testid="session-tail-text" title={text} className="min-w-0 truncate">
        {text}
      </span>
    </span>
  );
}

/** What a tail shows: a load error, else the newest tool call or text, else
 *  `emptyLabel` (or nothing) until the session has one. */
export function SessionTailLine({
  latest,
  error,
  emptyLabel,
}: {
  latest: TailLatest | undefined;
  error?: string | undefined;
  emptyLabel?: string | undefined;
}) {
  if (error !== undefined) {
    return (
      <span role="alert" title={error} className="block truncate text-destructive">
        {error}
      </span>
    );
  }
  if (latest?.kind === "tool") return <ToolLine latest={latest} />;
  if (latest?.text) return <TextLine text={latest.text} />;
  return emptyLabel !== undefined ? <span className="block truncate">{emptyLabel}</span> : null;
}
