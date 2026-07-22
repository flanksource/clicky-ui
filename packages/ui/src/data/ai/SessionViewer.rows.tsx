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
import type { SessionEventGroup } from "./SessionViewer.grouping";
import { EventMetadata, RawEventBlock } from "./SessionViewer.row-metadata";
import { formatEventRange } from "./SessionViewer.row-time";
import { ToolBody } from "./SessionViewer.tool-row";
import type { SessionToolDecision } from "./SessionViewer";
import { Markdown } from "../Markdown";

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
          DISC_TONE[visual.tone],
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



function UserRow({ event }: { event: SessionEvent }) {
  const [open, setOpen] = useState(false);
  const preview = event.text?.split("\n", 1)[0] ?? "Initial Prompt";
  return (
    <div className="not-prose text-xs text-muted-foreground">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start gap-1.5 text-left hover:text-foreground"
      >
        <span className="shrink-0 font-medium text-foreground">You</span>
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
          <Markdown text={event.text} />
        </div>
      )}
    </div>
  );
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

      <div className="min-w-0 whitespace-pre-wrap break-words text-sm font-medium leading-relaxed text-foreground">
        {event.text && <Markdown text={event.text} />}
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
      {event.pending && onPendingToolDecision && (
        <PendingDecisionControls event={event} onDecision={onPendingToolDecision} />
      )}
    </div>
  );
}

function QuestionToolBody({
  event,
  visual,
  onDecision,
}: {
  event: SessionEvent;
  visual: EventVisual;
  onDecision?: ((decision: SessionToolDecision) => Promise<void> | void) | undefined;
}) {
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
        {event.pending && onDecision && (
          <QuestionDecisionControls event={event} questions={questions} onDecision={onDecision} />
        )}
      </div>
    </div>
  );
}

function PendingDecisionControls({
  event,
  onDecision,
}: {
  event: SessionEvent;
  onDecision: (decision: SessionToolDecision) => Promise<void> | void;
}) {
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const decide = async (allow: boolean, message?: string) => {
    setBusy(true);
    setError("");
    try { await onDecision({ event, allow, ...(message ? { message } : {}) }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
    finally { setBusy(false); }
  };
  return (
    <div className="mt-2 space-y-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-density-3">
      <textarea aria-label="Decision comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional rejection feedback" className="min-h-16 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" loading={busy} onClick={() => decide(true)}><Icon icon={UiCheck} />Allow</Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => decide(false)}><Icon icon={UiCancel} />Reject</Button>
        <Button size="sm" variant="outline" disabled={busy || !comment.trim()} onClick={() => decide(false, comment.trim())}><Icon icon={UiComment} />Reject with comment</Button>
      </div>
      {error && <div role="alert" className="text-xs text-rose-600">{error}</div>}
    </div>
  );
}

function QuestionDecisionControls({
  event,
  questions,
  onDecision,
}: {
  event: SessionEvent;
  questions: SessionQuestion[];
  onDecision: (decision: SessionToolDecision) => Promise<void> | void;
}) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [details, setDetails] = useState<Record<string, string>>({});
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const decide = async (allow: boolean, message?: string) => {
    setBusy(true); setError("");
    const submittedAnswers = Object.fromEntries(Object.entries(answers).map(([question, answer]) => {
      const detail = details[question]?.trim();
      if (!detail) return [question, answer];
      return [question, Array.isArray(answer)
        ? [...answer, `Additional details: ${detail}`]
        : `${answer}\nAdditional details: ${detail}`];
    }));
    try { await onDecision({ event, allow, answers: submittedAnswers, ...(message ? { message } : {}) }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
    finally { setBusy(false); }
  };
  return (
    <div className="space-y-3 rounded-md border border-sky-500/25 bg-sky-500/5 p-density-3">
      {questions.map((question) => (
        <fieldset key={question.id} className="space-y-1.5">
          <legend className="text-sm font-medium text-foreground">{question.text}</legend>
          {question.options.map((option) => question.multiSelect ? (
            <label key={option.value} className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={Array.isArray(answers[question.text]) && (answers[question.text] as string[]).includes(option.value)} onChange={(e) => setAnswers((current) => { const selected = Array.isArray(current[question.text]) ? current[question.text] as string[] : []; return { ...current, [question.text]: e.target.checked ? [...selected, option.value] : selected.filter((value) => value !== option.value) }; })} />
              <span>{option.label}{option.description && <span className="ml-1 text-muted-foreground">{option.description}</span>}</span>
            </label>
          ) : (
            <label key={option.value} className="flex items-start gap-2 text-sm">
              <input type="radio" name={`question-${event.id}-${question.id}`} value={option.value} checked={answers[question.text] === option.value} onChange={() => setAnswers((current) => ({ ...current, [question.text]: option.value }))} />
              <span>{option.label}{option.description && <span className="ml-1 text-muted-foreground">{option.description}</span>}</span>
            </label>
          ))}
          <textarea
            aria-label={`${question.text} additional details`}
            value={question.options.length ? details[question.text] ?? "" : typeof answers[question.text] === "string" ? answers[question.text] as string : ""}
            onChange={(e) => question.options.length
              ? setDetails((current) => ({ ...current, [question.text]: e.target.value }))
              : setAnswers((current) => ({ ...current, [question.text]: e.target.value }))}
            placeholder={question.options.length ? "Additional details" : "Your answer"}
            className="min-h-16 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          />
        </fieldset>
      ))}
      <textarea aria-label="Rejection comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional rejection feedback" className="min-h-16 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" loading={busy} onClick={() => decide(true)}><Icon icon={UiCheck} />Send answer</Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => decide(false)}><Icon icon={UiCancel} />Reject</Button>
        <Button size="sm" variant="outline" disabled={busy || !comment.trim()} onClick={() => decide(false, comment.trim())}><Icon icon={UiComment} />Reject with comment</Button>
      </div>
      {error && <div role="alert" className="text-xs text-rose-600">{error}</div>}
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
