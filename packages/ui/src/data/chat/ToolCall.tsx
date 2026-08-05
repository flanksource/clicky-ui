import { useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/button";
import { Icon, type StaticIconComponent } from "../Icon";
import {
  UiCheck,
  UiChevronDown,
  UiCircleOutline,
  UiCircleX,
  UiClock,
  UiWrench,
} from "../../icons";
import type { AnyToolPart, ToolMeta, ToolResultRenderer } from "./types";
import { toolPartName } from "./types";
import { normalizeToolOutput } from "./tool-render/normalize";
import { useToolRenderRegistry } from "./tool-render/context";
import {
  defaultToolInputView,
  defaultToolOutputView,
  type ToolRenderBaseContext,
} from "./tool-render/defaults";
import type { ToolRenderRegistry } from "./tool-render/adapter";

export type ToolCallProps = {
  /** The tool part from an assistant message (typed or dynamic). */
  part: AnyToolPart;
  /** Whether the call body starts expanded. Defaults to false. */
  defaultOpen?: boolean;
  /** Respond to an approval request (only used when state is
   *  `approval-requested`). Receives the approval id, the decision, and an
   *  optional reason. */
  onApprove?:
    | ((approvalId: string, approved: boolean, reason?: string) => void)
    | undefined;
  renderToolResult?: ToolResultRenderer;
  /** Catalog entry for this tool. Defaults to the registry's catalog lookup. */
  tool?: ToolMeta | undefined;
  /** Renderer registry override. Defaults to the provided context registry. */
  registry?: ToolRenderRegistry | undefined;
  className?: string;
};

type ToolState = AnyToolPart["state"];

const STATUS_LABEL: Record<ToolState, string> = {
  "approval-requested": "Awaiting approval",
  "approval-responded": "Responded",
  "input-streaming": "Pending",
  "input-available": "Running",
  "output-available": "Completed",
  "output-denied": "Denied",
  "output-error": "Error",
};

const STATUS_ICON: Record<
  ToolState,
  { icon: StaticIconComponent; className: string }
> = {
  "approval-requested": { icon: UiClock, className: "text-amber-600" },
  "approval-responded": { icon: UiCheck, className: "text-sky-600" },
  "input-streaming": {
    icon: UiCircleOutline,
    className: "text-muted-foreground",
  },
  "input-available": {
    icon: UiClock,
    className: "text-muted-foreground animate-pulse",
  },
  "output-available": { icon: UiCheck, className: "text-emerald-600" },
  "output-denied": { icon: UiCircleX, className: "text-orange-600" },
  "output-error": { icon: UiCircleX, className: "text-destructive" },
};

/** Generic display of a single AI tool call: a collapsible header showing the
 *  tool name, status and compact input args, expanding to its input params and
 *  (once available) output or error. Input and output rendering go through the
 *  tool render registry, so a host can contribute domain views. Renders both
 *  clicky `dynamic-tool` parts and typed `tool-<name>` parts, keyed off
 *  `part.state`. */
export function ToolCall({
  part,
  defaultOpen = false,
  onApprove,
  renderToolResult,
  tool,
  registry: registryProp,
  className,
}: ToolCallProps) {
  const needsApproval = part.state === "approval-requested";
  const [open, setOpen] = useState(defaultOpen || needsApproval);
  const contextRegistry = useToolRenderRegistry();
  const registry = registryProp ?? contextRegistry;
  const status = STATUS_ICON[part.state];
  const name = toolPartName(part);
  const meta = tool ?? registry.tool(name);

  // The transport double-encodes tool results as `{output: "<json>"}`; every
  // surface — including a host's renderToolResult — sees the unwrapped value.
  const normalized = normalizeToolOutput(
    part.state === "output-available" ? part.output : undefined,
  );
  const base: ToolRenderBaseContext = {
    part,
    toolName: name,
    tool: meta,
    state: part.state,
    input: part.input,
    output: normalized.value,
    isError: normalized.isError || part.state === "output-error",
    options: registry.options,
  };

  const inputView = defaultToolInputView(base);
  // The header keeps the tool name in its own element; a summary renders beside
  // it (ToolCall.test.tsx matches the name by exact text).
  const summary = registry.resolveSummary({ ...base, defaultView: null });

  return (
    <div className={cn("not-prose mb-1 w-full", className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 py-0.5 text-muted-foreground hover:text-foreground"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <Icon icon={UiWrench} className="size-3 shrink-0" />
          <span className="truncate font-mono text-xs">{name}</span>
          <Icon
            icon={status.icon}
            title={STATUS_LABEL[part.state]}
            className={cn("size-3 shrink-0", status.className)}
          />
          {!open && summary ? (
            <span className="min-w-0 flex-1 truncate text-xs">{summary}</span>
          ) : null}
        </span>
        <Icon
          icon={UiChevronDown}
          className={cn(
            "size-3 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div data-slot="tool-call-details" className="space-y-1 pl-4 pt-0.5">
          {/* An approval-requested call force-opens, so this params table is
              what the user reads before approving a write. */}
          {registry.resolveInput({ ...base, defaultView: inputView }) ??
            inputView}
          <ToolOutput
            part={part}
            base={base}
            registry={registry}
            output={normalized.value}
            {...(renderToolResult ? { renderToolResult } : {})}
          />
        </div>
      )}

      {needsApproval && <ApprovalControls part={part} onApprove={onApprove} />}
    </div>
  );
}

/** Approve/Deny controls shown while a tool call awaits human approval. The
 *  approval id comes from the part's `approval` envelope (AI SDK v6). */
function ApprovalControls({
  part,
  onApprove,
}: {
  part: AnyToolPart;
  onApprove: ToolCallProps["onApprove"];
}) {
  const approval = "approval" in part ? part.approval : undefined;
  if (!approval || !onApprove) return null;
  return (
    <div className="mt-1.5 flex items-center gap-2 pl-4">
      <Button
        type="button"
        size="sm"
        onClick={() => onApprove(approval.id, true)}
      >
        Approve
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => onApprove(approval.id, false)}
      >
        Deny
      </Button>
    </div>
  );
}

/** The output surface. Priority: the host's `renderToolResult` prop (the
 *  pre-registry API, still supported), then a matching adapter, then the
 *  built-in shape heuristics. */
function ToolOutput({
  part,
  base,
  registry,
  output,
  renderToolResult,
}: {
  part: AnyToolPart;
  base: ToolRenderBaseContext;
  registry: ToolRenderRegistry;
  output: unknown;
  renderToolResult?: ToolResultRenderer | undefined;
}) {
  const errorText = part.state === "output-error" ? part.errorText : undefined;
  const hasOutput = part.state === "output-available" && output !== undefined;
  if (!hasOutput && errorText === undefined) {
    return null;
  }

  const defaultView: ReactNode = hasOutput ? defaultToolOutputView(base) : null;

  const custom = hasOutput
    ? renderToolResult?.({ part, toolName: base.toolName, output })
    : null;
  const resolved = hasOutput
    ? registry.resolveOutput({ ...base, defaultView })
    : null;

  return (
    <div
      className={cn(
        "overflow-x-auto text-xs",
        errorText ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {errorText !== undefined && <div>{errorText}</div>}
      {custom ?? resolved ?? defaultView}
    </div>
  );
}
