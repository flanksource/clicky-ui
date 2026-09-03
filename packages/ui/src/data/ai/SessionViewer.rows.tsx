import { useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Icon, type StaticIconComponent } from "../Icon";
import {
  UiBrain,
  UiChevronDown,
  UiSparkles,
  UiUserCircle,
  UiWarningTriangle,
} from "../../icons";
import {
  getSessionAction,
  type SessionEvent,
  type SessionTone,
} from "./SessionViewer.model";
import { SESSION_TONES } from "./session-tones";
import type { SessionEventGroup } from "./SessionViewer.grouping";
import { EventMetadata, RawEventBlock } from "./SessionViewer.row-metadata";
import { formatEventRange } from "./SessionViewer.row-time";
import { ToolBody } from "./SessionViewer.tool-row";
import type { SessionToolDecision } from "./SessionViewer";
import { Markdown } from "../Markdown";

export function SessionRow({
  event,
  last,
  defaultExpanded,
  showRowMetadata = false,
  showRaw = false,
  renderMessageBadge,
  onPendingToolDecision,
}: {
  event: SessionEvent;
  last: boolean;
  defaultExpanded: boolean;
  showRowMetadata?: boolean;
  showRaw?: boolean;
  renderMessageBadge?: ((event: SessionEvent) => ReactNode) | undefined;
  onPendingToolDecision?:
  | ((decision: SessionToolDecision) => Promise<void> | void)
  | undefined;
}) {
  if (event.kind === "user") {
    return (
      <UserRow
        event={event}
        showRowMetadata={showRowMetadata}
        showRaw={showRaw}
      />
    );
  }

  const visual = eventVisual(event);
  return (
    <li
      data-event-kind={event.kind}
      className="relative flex gap-density-3 pb-density-4 last:pb-0"
    >
      {!last && (
        <span
          aria-hidden
          className="absolute bottom-0 left-[10px] top-[22px] w-px bg-border"
        />
      )}
      <span
        className={cn(
          "relative z-[1] flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full",
          SESSION_TONES[visual.tone].disc,
        )}
      >
        <Icon icon={visual.icon} className="h-3 w-3" />
      </span>
      <div className="min-w-0 flex-1 pt-px">
        <EventBody
          event={event}
          visual={visual}
          defaultExpanded={defaultExpanded}
          messageBadge={
            event.kind === "assistant" ? renderMessageBadge?.(event) : undefined
          }
          onPendingToolDecision={onPendingToolDecision}
        />
        {showRowMetadata && <EventMetadata event={event} />}
        {showRaw && event.raw !== undefined && (
          <RawEventBlock raw={event.raw} />
        )}
      </div>
    </li>
  );
}

export function WaitGroupRow({
  group,
  last,
  defaultExpanded,
  showRowMetadata = false,
  showRaw = false,
  renderMessageBadge,
  onPendingToolDecision,
}: {
  group: SessionEventGroup;
  last: boolean;
  defaultExpanded: boolean;
  showRowMetadata?: boolean;
  showRaw?: boolean;
  renderMessageBadge?: ((event: SessionEvent) => ReactNode) | undefined;
  onPendingToolDecision?:
  | ((decision: SessionToolDecision) => Promise<void> | void)
  | undefined;
}) {
  const [open, setOpen] = useState(false);
  const visual = getSessionAction("Wait");
  const first = group.representative;
  const final = group.events[group.events.length - 1] ?? first;
  const label = `Wait × ${group.count}`;
  const metadataEvent = { ...first };
  delete metadataEvent.timestamp;
  delete metadataEvent.toolState;
  delete metadataEvent.approval;
  metadataEvent.pending = false;
  const timestampLabel = formatEventRange(first.timestamp, final.timestamp);

  return (
    <li
      data-event-kind="tool"
      data-event-group="wait"
      className="relative flex gap-density-3 pb-density-4 last:pb-0"
    >
      {!last && (
        <span
          aria-hidden
          className="absolute bottom-0 left-[10px] top-[22px] w-px bg-border"
        />
      )}
      <span
        className={cn(
          "relative z-[1] flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full",
          SESSION_TONES[visual.tone].disc,
        )}
      >
        <Icon icon={visual.icon} className="h-3 w-3" />
      </span>
      <div className="min-w-0 flex-1 pt-px">
        <button
          type="button"
          aria-expanded={open}
          aria-label={`${open ? "Collapse" : "Expand"} ${label}`}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center gap-1.5 text-left hover:text-foreground"
        >
          <span className="font-medium text-foreground">{label}</span>
          <Icon
            icon={UiChevronDown}
            className={cn(
              "ml-auto size-3 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
        {showRowMetadata && (
          <EventMetadata
            event={metadataEvent}
            {...(timestampLabel ? { timestampLabel } : {})}
          />
        )}
        {open && (
          <ol className="relative mt-density-3 border-l border-border pl-density-3">
            {group.events.map((event, index) => (
              <SessionRow
                key={event.id}
                event={event}
                last={index === group.events.length - 1}
                defaultExpanded={defaultExpanded}
                showRowMetadata={showRowMetadata}
                showRaw={showRaw}
                renderMessageBadge={renderMessageBadge}
                onPendingToolDecision={onPendingToolDecision}
              />
            ))}
          </ol>
        )}
      </div>
    </li>
  );
}

function UserRow({
  event,
  showRowMetadata,
  showRaw,
}: {
  event: SessionEvent;
  showRowMetadata: boolean;
  showRaw: boolean;
}) {
  return (
    <li
      data-event-kind="user"
      className="relative flex justify-end pb-density-4 last:pb-0"
    >
      <div className="flex max-w-[85%] items-start gap-density-3">
        <div className="min-w-0">
          <div className="mb-0.5 text-right text-xs font-medium text-muted-foreground">
            You
          </div>
          <div className="whitespace-pre-wrap break-words rounded-lg bg-accent px-density-3 py-density-2 text-right text-base font-medium leading-relaxed text-accent-foreground">
            {event.text}
          </div>
          {showRowMetadata && <EventMetadata event={event} align="right" />}
          {showRaw && event.raw !== undefined && (
            <RawEventBlock raw={event.raw} align="right" />
          )}
        </div>
        <span
          className={cn(
            "relative z-[1] flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full",
            SESSION_TONES.slate.disc,
          )}
        >
          <Icon icon={UiUserCircle} className="h-3 w-3" />
        </span>
      </div>
    </li>
  );
}

interface EventVisual {
  icon: StaticIconComponent;
  tone: SessionTone;
  label: string;
  summaryOnly: boolean;
}

// Base visuals per event kind. A row's `icon`/`tone` fields (set for a
// `verified`/`verify_failed` system row — see SessionViewer.model.ts) override
// these defaults; eventVisual applies that override uniformly below rather
// than special-casing it inside the switch.
function baseEventVisual(event: SessionEvent): EventVisual {
  switch (event.kind) {
    case "tool": {
      const action = getSessionAction(event.tool ?? "");
      return {
        icon: action.icon,
        tone: action.tone,
        label: action.label,
        summaryOnly: action.summaryOnly ?? false,
      };
    }
    case "user":
      return {
        icon: UiUserCircle,
        tone: "slate",
        label: "User",
        summaryOnly: false,
      };
    case "system":
      return {
        icon: UiSparkles,
        tone: "slate",
        label: "System",
        summaryOnly: false,
      };
    case "assistant":
      return {
        icon: UiSparkles,
        tone: "indigo",
        label: "Assistant",
        summaryOnly: false,
      };
    case "thinking":
      return {
        icon: UiBrain,
        tone: "slate",
        label: "Thinking",
        summaryOnly: false,
      };
    case "error":
      return {
        icon: UiWarningTriangle,
        tone: "rose",
        label: "Error",
        summaryOnly: false,
      };
  }
}

function eventVisual(event: SessionEvent): EventVisual {
  const base = baseEventVisual(event);
  return {
    ...base,
    icon: event.icon ?? base.icon,
    tone: event.tone ?? base.tone,
  };
}

function EventBody({
  event,
  visual,
  defaultExpanded,
  messageBadge,
  onPendingToolDecision,
}: {
  event: SessionEvent;
  visual: EventVisual;
  defaultExpanded: boolean;
  messageBadge?: ReactNode;
  onPendingToolDecision?:
  | ((decision: SessionToolDecision) => Promise<void> | void)
  | undefined;
}) {
  if (event.kind === "tool")
    return (
      <ToolBody
        event={event}
        visual={visual}
        defaultExpanded={defaultExpanded}
        onPendingToolDecision={onPendingToolDecision}
      />
    );
  if (event.kind === "thinking") return <ThinkingBody event={event} />;
  if (event.kind === "error") return <ErrorBody event={event} />;
  if (event.kind === "system") return <SystemBody event={event} />;
  return <MessageBody event={event} badge={messageBadge} />;
}

function MessageBody({
  event,
  badge,
}: {
  event: SessionEvent;
  badge?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-1.5">
      {badge}
      <div className="min-w-0 whitespace-pre-wrap break-words text-sm font-medium leading-relaxed text-foreground">
        {event.text && <Markdown text={event.text} />}
      </div>
    </div>
  );
}

function SystemBody({ event }: { event: SessionEvent }) {
  const [open, setOpen] = useState(false);
  const preview = event.text?.split("\n", 1)[0] ?? "System instructions";
  return (
    <div className="not-prose text-xs text-muted-foreground">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start gap-1.5 text-left hover:text-foreground"
      >
        <span className="shrink-0 font-medium text-foreground">System</span>
        <span className="min-w-0 flex-1 truncate">{preview}</span>
        <Icon
          icon={UiChevronDown}
          className={cn(
            "mt-0.5 size-3 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="mt-1.5 whitespace-pre-wrap break-words  bg-muted/20 px-density-3 py-density-2 leading-relaxed">
          {event.text && <Markdown text={event.text} />}
        </div>
      )}
    </div>
  );
}

// Reasoning shows its text directly — truncated to one line, click to expand.
function ThinkingBody({ event }: { event: SessionEvent }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="not-prose">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start gap-1.5 text-left text-xs italic leading-relaxed text-muted-foreground hover:text-foreground"
      >
        <span
          className={cn(
            "min-w-0 flex-1",
            open ? "whitespace-pre-wrap break-words" : "truncate",
          )}
        >
          {event.text}
        </span>
        <Icon
          icon={UiChevronDown}
          className={cn(
            "mt-0.5 size-3 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
    </div>
  );
}

function ErrorBody({ event }: { event: SessionEvent }) {
  return (
    <div className="rounded-md border border-rose-200 bg-rose-50 px-density-3 py-1.5 text-xs text-rose-700 [[data-theme=dark]_&]:border-rose-500/30 [[data-theme=dark]_&]:bg-rose-500/10 [[data-theme=dark]_&]:text-rose-300">
      {event.text}
    </div>
  );
}
