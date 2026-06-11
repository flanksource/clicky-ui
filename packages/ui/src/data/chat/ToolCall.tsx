import { useState } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/button";
import { Icon, type StaticIconComponent } from "../Icon";
import { CodeBlock } from "../CodeBlock";
import {
  UiCheck,
  UiChevronDown,
  UiCircleOutline,
  UiCircleX,
  UiClock,
  UiWrench,
} from "../../icons";
import type { AnyToolPart } from "./types";
import { toolPartName } from "./types";

export type ToolCallProps = {
  /** The tool part from an assistant message (typed or dynamic). */
  part: AnyToolPart;
  /** Whether the call body starts expanded. Defaults to false. */
  defaultOpen?: boolean;
  /** Respond to an approval request (only used when state is
   *  `approval-requested`). Receives the approval id, the decision, and an
   *  optional reason. */
  onApprove?: ((approvalId: string, approved: boolean, reason?: string) => void) | undefined;
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

const STATUS_ICON: Record<ToolState, { icon: StaticIconComponent; className: string }> = {
  "approval-requested": { icon: UiClock, className: "text-amber-600" },
  "approval-responded": { icon: UiCheck, className: "text-sky-600" },
  "input-streaming": { icon: UiCircleOutline, className: "text-muted-foreground" },
  "input-available": { icon: UiClock, className: "text-muted-foreground animate-pulse" },
  "output-available": { icon: UiCheck, className: "text-emerald-600" },
  "output-denied": { icon: UiCircleX, className: "text-orange-600" },
  "output-error": { icon: UiCircleX, className: "text-destructive" },
};

/** Generic display of a single AI tool call: a collapsible header showing the
 *  tool name + status, expanding to its JSON input and (once available) output
 *  or error. Renders both clicky `dynamic-tool` parts and typed `tool-<name>`
 *  parts, keyed off `part.state`. */
export function ToolCall({ part, defaultOpen = false, onApprove, className }: ToolCallProps) {
  const needsApproval = part.state === "approval-requested";
  const [open, setOpen] = useState(defaultOpen || needsApproval);
  const status = STATUS_ICON[part.state];
  const name = toolPartName(part);

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
        </span>
        <Icon
          icon={UiChevronDown}
          className={cn("size-3 shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="space-y-1 pl-4 pt-0.5">
          <ToolInput input={part.input} />
          <ToolOutput part={part} />
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
      <Button type="button" size="sm" onClick={() => onApprove(approval.id, true)}>
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

function ToolInput({ input }: { input: AnyToolPart["input"] }) {
  if (input === undefined || input === null) {
    return null;
  }
  return (
    <div className="overflow-hidden text-xs">
      <CodeBlock language="json" source={JSON.stringify(input, null, 2)} />
    </div>
  );
}

function ToolOutput({ part }: { part: AnyToolPart }) {
  const errorText = part.state === "output-error" ? part.errorText : undefined;
  const output = part.state === "output-available" ? part.output : undefined;
  if (output === undefined && errorText === undefined) {
    return null;
  }
  return (
    <div className={cn("overflow-x-auto text-xs", errorText ? "text-destructive" : "text-muted-foreground")}>
      {errorText !== undefined && <div>{errorText}</div>}
      {output !== undefined && (
        <CodeBlock language="json" source={typeof output === "string" ? output : JSON.stringify(output, null, 2)} />
      )}
    </div>
  );
}
