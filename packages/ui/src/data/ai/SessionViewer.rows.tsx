import { useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Icon, type StaticIconComponent } from "../Icon";
import { CodeBlock } from "../CodeBlock";
import { CodeDiff } from "../CodeDiff";
import {
  UiBrain,
  UiChevronDown,
  UiSparkles,
  UiUserCircle,
  UiWarningTriangle,
} from "../../icons";
import { APPROVAL_ICONS } from "./agent-action-icons";
import {
  getSessionAction,
  type SessionEvent,
  type SessionTone,
} from "./SessionViewer.model";
import {
  shellCommand,
  questionsFromToolInput,
  summarizeToolInput,
  toolDiff,
  toolInputParams,
  type SessionQuestion,
  type ToolDiff,
  type ToolParam,
} from "./SessionViewer.input";

// Disc colors per tone. The dark variants key off a `[data-theme="dark"]`
// ancestor (the document attribute set by ThemeProvider, or the component-level
// override painted on this viewer's root) rather than Tailwind's `dark:` —
// which this library compiles to `prefers-color-scheme` and so would ignore the
// `data-theme` attribute. Written as literal class strings so Tailwind scans them.
const DISC_TONE: Record<SessionTone, string> = {
  sky: "bg-sky-100 text-sky-700 [[data-theme=dark]_&]:bg-sky-500/15 [[data-theme=dark]_&]:text-sky-300",
  amber:
    "bg-amber-100 text-amber-700 [[data-theme=dark]_&]:bg-amber-500/15 [[data-theme=dark]_&]:text-amber-300",
  violet:
    "bg-violet-100 text-violet-700 [[data-theme=dark]_&]:bg-violet-500/15 [[data-theme=dark]_&]:text-violet-300",
  emerald:
    "bg-emerald-100 text-emerald-700 [[data-theme=dark]_&]:bg-emerald-500/15 [[data-theme=dark]_&]:text-emerald-300",
  teal: "bg-teal-100 text-teal-700 [[data-theme=dark]_&]:bg-teal-500/15 [[data-theme=dark]_&]:text-teal-300",
  orange:
    "bg-orange-100 text-orange-700 [[data-theme=dark]_&]:bg-orange-500/15 [[data-theme=dark]_&]:text-orange-300",
  rose: "bg-rose-100 text-rose-700 [[data-theme=dark]_&]:bg-rose-500/15 [[data-theme=dark]_&]:text-rose-300",
  indigo:
    "bg-indigo-100 text-indigo-700 [[data-theme=dark]_&]:bg-indigo-500/15 [[data-theme=dark]_&]:text-indigo-300",
  fuchsia:
    "bg-fuchsia-100 text-fuchsia-700 [[data-theme=dark]_&]:bg-fuchsia-500/15 [[data-theme=dark]_&]:text-fuchsia-300",
  pink: "bg-pink-100 text-pink-700 [[data-theme=dark]_&]:bg-pink-500/15 [[data-theme=dark]_&]:text-pink-300",
  slate: "bg-muted text-muted-foreground",
};

export function SessionRow({
  event,
  last,
  defaultExpanded,
  showRowMetadata = false,
  showRaw = false,
}: {
  event: SessionEvent;
  last: boolean;
  defaultExpanded: boolean;
  showRowMetadata?: boolean;
  showRaw?: boolean;
}) {
  if (event.kind === "user")
    return <UserRow event={event} showRowMetadata={showRowMetadata} showRaw={showRaw} />;

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
          DISC_TONE[visual.tone],
        )}
      >
        <Icon icon={visual.icon} className="h-3 w-3" />
      </span>
      <div className="min-w-0 flex-1 pt-px">
        <EventBody
          event={event}
          visual={visual}
          defaultExpanded={defaultExpanded}
        />
        {showRowMetadata && <EventMetadata event={event} />}
        {showRaw && event.raw !== undefined && <RawEventBlock raw={event.raw} />}
      </div>
    </li>
  );
}

// User prompts and selections sit on the right, like a chat composer turn.
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
          {showRaw && event.raw !== undefined && <RawEventBlock raw={event.raw} align="right" />}
        </div>
        <span
          className={cn(
            "relative z-[1] flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full",
            DISC_TONE.slate,
          )}
        >
          <Icon icon={UiUserCircle} className="h-3 w-3" />
        </span>
      </div>
    </li>
  );
}

function EventMetadata({
  event,
  align = "left",
}: {
  event: SessionEvent;
  align?: "left" | "right";
}) {
  const parts = [
    event.timestamp ? formatEventTime(event.timestamp) : "",
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
    return event.approval.reason ? `denied: ${event.approval.reason}` : "denied";
  }
  if (event.approval) return "approval pending";
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
  if (event.approval?.approved === false || event.toolState === "output-denied") {
    const reason = event.approval?.reason ? `: ${event.approval.reason}` : "";
    return {
      label: `Denied${reason}`,
      icon: APPROVAL_ICONS.denied.icon,
      className:
        "border-rose-500/30 bg-rose-500/10 text-rose-700 [[data-theme=dark]_&]:text-rose-300",
    };
  }
  if (event.approval || event.toolState === "approval-requested") {
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

function ApprovalBadge({ event }: { event: SessionEvent }) {
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

function formatEventTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function RawEventBlock({ raw, align = "left" }: { raw: unknown; align?: "left" | "right" }) {
  const source = rawToSource(raw);
  return (
    <details className={cn("mt-1.5 text-left", align === "right" && "ml-auto max-w-full")}>
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

interface EventVisual {
  icon: StaticIconComponent;
  tone: SessionTone;
  label: string;
  summaryOnly: boolean;
}

function eventVisual(event: SessionEvent): EventVisual {
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

function EventBody({
  event,
  visual,
  defaultExpanded,
}: {
  event: SessionEvent;
  visual: EventVisual;
  defaultExpanded: boolean;
}) {
  if (event.kind === "tool")
    return (
      <ToolBody
        event={event}
        visual={visual}
        defaultExpanded={defaultExpanded}
      />
    );
  if (event.kind === "thinking") return <ThinkingBody event={event} />;
  if (event.kind === "error") return <ErrorBody event={event} />;
  if (event.kind === "system") return <SystemBody event={event} />;
  return <MessageBody event={event} />;
}

function ToolBody({
  event,
  visual,
  defaultExpanded,
}: {
  event: SessionEvent;
  visual: EventVisual;
  defaultExpanded: boolean;
}) {
  const summary = summarizeToolInput(
    event.tool ?? "",
    event.toolInput,
    event.cwd,
  );
  const command = shellCommand(event.tool ?? "", event.toolInput);
  const [open, setOpen] = useState(defaultExpanded);

  if (event.tool === "AskUserQuestion") {
    return <QuestionToolBody event={event} visual={visual} />;
  }

  // Shell rows inline the full command as a bash block — no "Run command"
  // label, no tool-input JSON. Only the response stays behind the chevron.
  if (command !== undefined) {
    return (
      <div className="not-prose">
        <div className="flex items-start gap-1.5">
          <div className="min-w-0 flex-1">
            <CodeBlock bare language="bash" source={command} />
          </div>
          <ApprovalBadge event={event} />
          {event.toolResponse !== undefined && (
            <button
              type="button"
              aria-expanded={open}
              aria-label="Toggle response"
              onClick={() => setOpen((value) => !value)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Icon
                icon={UiChevronDown}
                className={cn(
                  "size-3 shrink-0 transition-transform",
                  open && "rotate-180",
                )}
              />
            </button>
          )}
        </div>
        {open && event.toolResponse !== undefined && (
          <div className="mt-1.5">
            <ResponseBlock response={event.toolResponse} />
          </div>
        )}
      </div>
    );
  }

  const hasDetail =
    event.toolInput !== undefined || event.toolResponse !== undefined;
  const params = toolInputParams(event.tool ?? "", event.toolInput, event.cwd);
  const diff = toolDiff(event.tool ?? "", event.toolInput);
  // summaryOnly rows (file ops) read as their path alone — the icon carries the
  // verb. Remaining input keys follow as JetBrains-style inline param hints;
  // write-type rows carry a +/- diff stat.
  const header = (
    <>
      {visual.summaryOnly && summary ? (
        <span className="min-w-0 truncate font-mono text-xs text-foreground ">
          {summary}
        </span>
      ) : (
        <span className="shrink-0 font-medium text-foreground">
          {visual.label}
        </span>
      )}
      {diff && (
        <span className="shrink-0 font-mono text-xs">
          {diff.added > 0 && (
            <span className="text-emerald-600 [[data-theme=dark]_&]:text-emerald-400">
              +{diff.added}
            </span>
          )}
          {diff.removed > 0 && (
            <span className="ml-1 text-rose-600 [[data-theme=dark]_&]:text-rose-400">
              -{diff.removed}
            </span>
          )}
        </span>
      )}
      <ApprovalBadge event={event} />
      {params.length > 0 && <InlineParams params={params} />}
    </>
  );

  return (
    <div className="not-prose">
      {hasDetail ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center gap-1.5 text-left hover:text-foreground"
        >
          {header}
          <Icon
            icon={UiChevronDown}
            className={cn(
              "ml-auto size-3 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
      ) : (
        <div className="flex items-center gap-1.5">{header}</div>
      )}

      {open && hasDetail && (
        <div className="mt-1.5 space-y-1.5">
          {diff ? (
            <DiffBlock diff={diff} />
          ) : (
            event.toolInput !== undefined && (
              <DetailBlock
                language="json"
                source={JSON.stringify(event.toolInput, null, 2)}
              />
            )
          )}
          {event.toolResponse !== undefined && (
            <ResponseBlock response={event.toolResponse} />
          )}
        </div>
      )}
    </div>
  );
}

function QuestionToolBody({ event, visual }: { event: SessionEvent; visual: EventVisual }) {
  const questions = questionsFromToolInput(event.toolInput);
  const summary = summarizeToolInput(event.tool ?? "", event.toolInput, event.cwd);

  return (
    <div className="not-prose">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="shrink-0 font-medium text-foreground">{visual.label}</span>
        <ApprovalBadge event={event} />
        {summary && questions.length !== 1 && (
          <span className="min-w-0 truncate text-xs text-muted-foreground">{summary}</span>
        )}
      </div>
      <div className="mt-1.5 space-y-1.5">
        {questions.length > 0 ? (
          questions.map((question, index) => (
            <QuestionCard key={`${question.id}-${index}`} question={question} index={index} />
          ))
        ) : event.toolInput ? (
          <DetailBlock language="json" source={JSON.stringify(event.toolInput, null, 2)} />
        ) : null}
        {event.toolResponse !== undefined && (
          <div className="space-y-1">
            <div className="text-[11px] font-medium uppercase text-muted-foreground">Answer</div>
            <ResponseBlock response={event.toolResponse} />
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionCard({ question, index }: { question: SessionQuestion; index: number }) {
  const label = question.context || (question.id ? `Question ${question.id}` : `Question ${index + 1}`);
  return (
    <div className="rounded-md border border-sky-500/20 bg-sky-500/5 px-density-3 py-density-2">
      <div className="text-[11px] font-medium uppercase text-muted-foreground">{label}</div>
      <div className="mt-0.5 whitespace-pre-wrap break-words text-sm text-foreground">{question.text}</div>
      {question.options.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {question.options.map((option) => (
            <span
              key={option.value}
              className="rounded border border-border bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground"
            >
              <span className="font-medium text-foreground">{option.label}</span>
              {option.description && <span className="ml-1">{option.description}</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// A single truncating line of `name: value` hints — the container clips with an
// ellipsis instead of wrapping, and each value is already truncated by the model.
function InlineParams({ params }: { params: ToolParam[] }) {
  return (
    <span className="min-w-0 flex-1 truncate font-mono text-xs">
      {params.map((param) => (
        <span key={param.name} className="[&:not(:first-child)]:ml-2">
          <span className="text-muted-foreground/70">{param.name}: </span>
          <span className="text-muted-foreground">{param.value}</span>
        </span>
      ))}
    </span>
  );
}

// Language-aware line diff for write-type tools: each edit renders as a
// `CodeDiff` (real LCS + Shiki highlighting) with git-style add/remove gutters
// whose tints track the theme tokens.
function DiffBlock({ diff }: { diff: ToolDiff }) {
  return (
    <div className="space-y-1.5">
      {diff.segments.map((segment, index) => (
        <CodeDiff
          key={index}
          bare
          showLineNumbers={false}
          original={segment.original}
          modified={segment.modified}
          {...(diff.language ? { language: diff.language } : {})}
        />
      ))}
    </div>
  );
}

function ResponseBlock({ response }: { response: string }) {
  const trimmed = response.trim();
  const isJson = trimmed.startsWith("{") || trimmed.startsWith("[");
  return <DetailBlock language={isJson ? "json" : "text"} source={response} />;
}

function DetailBlock({
  language,
  source,
}: {
  language: string;
  source: string;
}): ReactNode {
  return (
    <div className="overflow-x-auto text-xs">
      <CodeBlock bare language={language} source={source} />
    </div>
  );
}

function MessageBody({ event }: { event: SessionEvent }) {
  return (
    <div className="whitespace-pre-wrap break-words text-base font-medium leading-relaxed text-foreground">
      {event.text}
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
          className={cn("mt-0.5 size-3 shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="mt-1.5 whitespace-pre-wrap break-words rounded-md border border-border bg-muted/40 px-density-3 py-density-2 leading-relaxed">
          {event.text}
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
