import { cn } from "../../lib/utils";
import { Icon, type StaticIconComponent } from "../Icon";
import { CodeBlock } from "../CodeBlock";
import { APPROVAL_ICONS } from "./agent-action-icons";
import type { SessionEvent } from "./SessionViewer.model";
import { formatEventTime } from "./SessionViewer.row-time";

export function EventMetadata({
  event,
  align = "left",
  timestampLabel,
}: {
  event: SessionEvent;
  align?: "left" | "right";
  timestampLabel?: string;
}) {
  const parts = [
    timestampLabel ?? (event.timestamp ? formatEventTime(event.timestamp) : ""),
    event.source,
    event.model,
    event.reasoningEffort,
    event.turnId ? `turn ${event.turnId}` : "",
    event.agentId ? `agent ${event.agentId}` : "",
    event.toolState,
    approvalLabel(event),
  ].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <div
      className={cn(
        "mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground",
        align === "right" && "justify-end text-right",
      )}
    >
      {parts.map((part, index) => (
        <span key={`${part}-${index}`} className="min-w-0 truncate">
          {part}
        </span>
      ))}
    </div>
  );
}

function approvalLabel(event: SessionEvent) {
  if (event.approval?.approved === true) return "approved";
  if (event.approval?.approved === false) {
    return event.approval.reason
      ? `denied: ${event.approval.reason}`
      : "denied";
  }
  if (event.pending) return "approval pending";
  if (event.toolState === "output-denied") return "denied";
  return "";
}

function approvalStatus(
  event: SessionEvent,
): { label: string; className: string; icon: StaticIconComponent } | null {
  if (event.approval?.approved === true) {
    return {
      label: "Approved",
      icon: APPROVAL_ICONS.approved.icon,
      className:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 [[data-theme=dark]_&]:text-emerald-300",
    };
  }
  if (
    event.approval?.approved === false ||
    event.toolState === "output-denied"
  ) {
    const reason = event.approval?.reason ? `: ${event.approval.reason}` : "";
    return {
      label: `Denied${reason}`,
      icon: APPROVAL_ICONS.denied.icon,
      className:
        "border-rose-500/30 bg-rose-500/10 text-rose-700 [[data-theme=dark]_&]:text-rose-300",
    };
  }
  if (event.pending) {
    return {
      label: "Awaiting approval",
      icon: APPROVAL_ICONS.pending.icon,
      className:
        "border-amber-500/30 bg-amber-500/10 text-amber-700 [[data-theme=dark]_&]:text-amber-300",
    };
  }
  if (event.toolState === "approval-responded") {
    return {
      label: "Approval answered",
      icon: APPROVAL_ICONS.question.icon,
      className:
        "border-sky-500/30 bg-sky-500/10 text-sky-700 [[data-theme=dark]_&]:text-sky-300",
    };
  }
  return null;
}

export function ApprovalBadge({ event }: { event: SessionEvent }) {
  const status = approvalStatus(event);
  if (!status) return null;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium",
        status.className,
      )}
    >
      <Icon icon={status.icon} className="size-3" />
      {status.label}
    </span>
  );
}

export function RawEventBlock({
  raw,
  align = "left",
}: {
  raw: unknown;
  align?: "left" | "right";
}) {
  const source = rawToSource(raw);
  return (
    <details
      className={cn(
        "mt-1.5 text-left",
        align === "right" && "ml-auto max-w-full",
      )}
    >
      <summary className="cursor-pointer text-[11px] text-muted-foreground hover:text-foreground">
        Raw
      </summary>
      <div className="mt-1">
        <CodeBlock language="json" source={source} jsonDefaultOpenDepth={1} />
      </div>
    </details>
  );
}

function rawToSource(raw: unknown) {
  if (typeof raw === "string") {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
  }
  try {
    return JSON.stringify(raw, null, 2);
  } catch {
    return String(raw);
  }
}
