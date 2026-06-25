import { useMemo, useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Icon, type StaticIconComponent } from "../Icon";
import { CodeBlock } from "../CodeBlock";
import { useDensityValue, type Density } from "../../hooks/use-density";
import { DensityValueProvider } from "../../hooks/density-provider";
import {
  UiBrain,
  UiChevronDown,
  UiRobotAi,
  UiSparkles,
  UiUserCircle,
  UiWarningTriangle,
} from "../../icons";
import {
  getSessionAction,
  normalizeSession,
  summarizeSession,
  summarizeToolInput,
  type SessionEvent,
  type SessionInput,
  type SessionTone,
} from "./SessionViewer.model";
import {
  collectSessionFilters,
  isEventVisible,
  type SessionCategory,
} from "./session-categories";
import { SessionViewerMenu, type SessionThemeOverride } from "./SessionViewerMenu";

export type {
  SessionEntry,
  SessionEvent,
  SessionInput,
  SessionActionMeta,
} from "./SessionViewer.model";
export type { SessionThemeOverride } from "./SessionViewerMenu";

export interface SessionViewerProps {
  /** A captain session: parsed `SessionEntry[]` or raw log text (JSON / JSONL). */
  session: SessionInput;
  className?: string;
  /** Expand each tool call's input/output by default. Defaults to false. */
  defaultExpanded?: boolean;
  /** Render assistant reasoning ("thinking") blocks. Defaults to true. */
  showThinking?: boolean;
  /** Show the summary header (model + action counts). Defaults to true. */
  showHeader?: boolean;
  /** Show the 3-dot menu (density + category/tool/source filters). Defaults to true. */
  showMenu?: boolean;
  /** Initial density override; undefined inherits the page/document density. */
  defaultDensity?: Density;
  /** Initial theme override; undefined inherits the page/document `data-theme`. */
  defaultTheme?: SessionThemeOverride;
}

// Disc colors per tone. The dark variants key off a `[data-theme="dark"]`
// ancestor (the document attribute set by ThemeProvider, or the component-level
// override painted on this viewer's root) rather than Tailwind's `dark:` —
// which this library compiles to `prefers-color-scheme` and so would ignore the
// `data-theme` attribute. Written as literal class strings so Tailwind scans them.
const DISC_TONE: Record<SessionTone, string> = {
  sky: "bg-sky-100 text-sky-700 [[data-theme=dark]_&]:bg-sky-500/15 [[data-theme=dark]_&]:text-sky-300",
  amber: "bg-amber-100 text-amber-700 [[data-theme=dark]_&]:bg-amber-500/15 [[data-theme=dark]_&]:text-amber-300",
  violet: "bg-violet-100 text-violet-700 [[data-theme=dark]_&]:bg-violet-500/15 [[data-theme=dark]_&]:text-violet-300",
  emerald: "bg-emerald-100 text-emerald-700 [[data-theme=dark]_&]:bg-emerald-500/15 [[data-theme=dark]_&]:text-emerald-300",
  rose: "bg-rose-100 text-rose-700 [[data-theme=dark]_&]:bg-rose-500/15 [[data-theme=dark]_&]:text-rose-300",
  indigo: "bg-indigo-100 text-indigo-700 [[data-theme=dark]_&]:bg-indigo-500/15 [[data-theme=dark]_&]:text-indigo-300",
  fuchsia: "bg-fuchsia-100 text-fuchsia-700 [[data-theme=dark]_&]:bg-fuchsia-500/15 [[data-theme=dark]_&]:text-fuchsia-300",
  pink: "bg-pink-100 text-pink-700 [[data-theme=dark]_&]:bg-pink-500/15 [[data-theme=dark]_&]:text-pink-300",
  slate: "bg-muted text-muted-foreground",
};

function toggleInSet<T>(set: ReadonlySet<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

/**
 * SessionViewer renders a recorded AI coding-agent session (the captain
 * `pkg/ai/history` JSON schema — Claude Code / Codex transcripts) as a vertical
 * action log. Each entry sits on a tone-colored icon disc from the Flanksource
 * "Agent Action Icons" set; user prompts/selections are right-aligned like a
 * chat. Tool calls expand to their input and response. The "3-dot" menu mirrors
 * `captain history` filtering — toggle density and hide categories, tools or
 * sources.
 */
export function SessionViewer({
  session,
  className,
  defaultExpanded = false,
  showThinking = true,
  showHeader = true,
  showMenu = true,
  defaultDensity,
  defaultTheme,
}: SessionViewerProps) {
  const allEvents = useMemo(() => normalizeSession(session), [session]);

  const pageDensity = useDensityValue();
  const [densityOverride, setDensityOverride] = useState<Density | undefined>(defaultDensity);
  const [themeOverride, setThemeOverride] = useState<SessionThemeOverride | undefined>(defaultTheme);
  const [hiddenCategories, setHiddenCategories] = useState<ReadonlySet<SessionCategory>>(
    () => new Set(),
  );
  const [hiddenTools, setHiddenTools] = useState<ReadonlySet<string>>(() => new Set());
  const [hiddenSources, setHiddenSources] = useState<ReadonlySet<string>>(() => new Set());
  // Undefined = follow the `showThinking` prop; the menu toggle sets an override.
  const [showThinkingOverride, setShowThinkingOverride] = useState<boolean | undefined>(undefined);
  const effectiveShowThinking = showThinkingOverride ?? showThinking;

  const filters = useMemo(() => collectSessionFilters(allEvents), [allEvents]);
  const hasThinking = useMemo(() => allEvents.some((e) => e.kind === "thinking"), [allEvents]);

  const visibility = { hiddenCategories, hiddenTools, hiddenSources, showThinking: effectiveShowThinking };
  const events = allEvents.filter((event) => isEventVisible(event, visibility));

  if (allEvents.length === 0) {
    return (
      <div
        className={cn(
          "rounded-md border border-dashed border-border p-density-4 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        No session activity.
      </div>
    );
  }

  const summary = summarizeSession(allEvents);
  const effectiveDensity = densityOverride ?? pageDensity;
  const dataAttrs: Record<string, string> = {
    ...(densityOverride ? { "data-density": densityOverride } : {}),
    ...(themeOverride ? { "data-theme": themeOverride } : {}),
  };

  return (
    <div className={cn("text-sm", className)} {...dataAttrs}>
      <DensityValueProvider density={effectiveDensity}>
        {(showHeader || showMenu) && (
          <div className="mb-density-3 flex items-center justify-between gap-density-3">
            <div className="flex flex-wrap items-center gap-x-density-3 gap-y-1 text-xs text-muted-foreground">
              {showHeader && summary.model && (
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  <Icon icon={UiRobotAi} className="size-3.5" />
                  {summary.model}
                </span>
              )}
              {showHeader && <span>{summary.toolCount} actions</span>}
              {showHeader && <span>{summary.messageCount} messages</span>}
            </div>
            {showMenu && (
              <SessionViewerMenu
                density={densityOverride}
                onDensityChange={setDensityOverride}
                theme={themeOverride}
                onThemeChange={setThemeOverride}
                filters={filters}
                hiddenCategories={hiddenCategories}
                hiddenTools={hiddenTools}
                hiddenSources={hiddenSources}
                onToggleCategory={(category) =>
                  setHiddenCategories((set) => toggleInSet(set, category))
                }
                onToggleTool={(tool) => setHiddenTools((set) => toggleInSet(set, tool))}
                onToggleSource={(source) => setHiddenSources((set) => toggleInSet(set, source))}
                showThinking={effectiveShowThinking}
                onToggleThinking={() => setShowThinkingOverride(!effectiveShowThinking)}
                hasThinking={hasThinking}
              />
            )}
          </div>
        )}

        {events.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-density-4 text-center text-sm text-muted-foreground">
            All actions are hidden by the active filters.
          </div>
        ) : (
          <ol className="relative">
            {events.map((event, index) => (
              <SessionRow
                key={event.id}
                event={event}
                last={index === events.length - 1}
                defaultExpanded={defaultExpanded}
              />
            ))}
          </ol>
        )}
      </DensityValueProvider>
    </div>
  );
}

function SessionRow({
  event,
  last,
  defaultExpanded,
}: {
  event: SessionEvent;
  last: boolean;
  defaultExpanded: boolean;
}) {
  if (event.kind === "user") return <UserRow event={event} />;

  const visual = eventVisual(event);
  return (
    <li data-event-kind={event.kind} className="relative flex gap-density-3 pb-density-4 last:pb-0">
      {!last && <span aria-hidden className="absolute bottom-0 left-[10px] top-[22px] w-px bg-border" />}
      <span
        className={cn(
          "relative z-[1] flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full",
          DISC_TONE[visual.tone],
        )}
      >
        <Icon icon={visual.icon} className="h-3 w-3" />
      </span>
      <div className="min-w-0 flex-1 pt-px">
        <EventBody event={event} visual={visual} defaultExpanded={defaultExpanded} />
      </div>
    </li>
  );
}

// User prompts and selections sit on the right, like a chat composer turn.
function UserRow({ event }: { event: SessionEvent }) {
  return (
    <li data-event-kind="user" className="relative flex justify-end pb-density-4 last:pb-0">
      <div className="flex max-w-[85%] items-start gap-density-3">
        <div className="min-w-0">
          <div className="mb-0.5 text-right text-xs font-medium text-muted-foreground">You</div>
          <div className="whitespace-pre-wrap break-words rounded-lg bg-accent px-density-3 py-density-2 text-right leading-relaxed text-accent-foreground">
            {event.text}
          </div>
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

interface EventVisual {
  icon: StaticIconComponent;
  tone: SessionTone;
  label: string;
}

function eventVisual(event: SessionEvent): EventVisual {
  switch (event.kind) {
    case "tool": {
      const action = getSessionAction(event.tool ?? "");
      return { icon: action.icon, tone: action.tone, label: action.label };
    }
    case "user":
      return { icon: UiUserCircle, tone: "slate", label: "User" };
    case "assistant":
      return { icon: UiSparkles, tone: "indigo", label: "Assistant" };
    case "thinking":
      return { icon: UiBrain, tone: "slate", label: "Thinking" };
    case "error":
      return { icon: UiWarningTriangle, tone: "rose", label: "Error" };
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
  if (event.kind === "tool") return <ToolBody event={event} label={visual.label} defaultExpanded={defaultExpanded} />;
  if (event.kind === "thinking") return <ThinkingBody event={event} />;
  if (event.kind === "error") return <ErrorBody event={event} />;
  return <MessageBody event={event} label={visual.label} />;
}

function ToolBody({
  event,
  label,
  defaultExpanded,
}: {
  event: SessionEvent;
  label: string;
  defaultExpanded: boolean;
}) {
  const summary = summarizeToolInput(event.tool ?? "", event.toolInput);
  const hasDetail = event.toolInput !== undefined || event.toolResponse !== undefined;
  const [open, setOpen] = useState(defaultExpanded);

  const header = (
    <>
      <span className="font-medium text-foreground">{label}</span>
      {summary && <span className="truncate font-mono text-xs text-muted-foreground">{summary}</span>}
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
            className={cn("ml-auto size-3 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        </button>
      ) : (
        <div className="flex items-center gap-1.5">{header}</div>
      )}

      {(event.model || event.source) && (
        <div className="mt-0.5 flex gap-density-2 text-[11px] text-muted-foreground">
          {event.source && <span>{event.source}</span>}
          {event.model && <span>{event.model}</span>}
          {event.reasoningEffort && <span>effort: {event.reasoningEffort}</span>}
        </div>
      )}

      {open && hasDetail && (
        <div className="mt-1.5 space-y-1.5">
          {event.toolInput !== undefined && (
            <DetailBlock language="json" source={JSON.stringify(event.toolInput, null, 2)} />
          )}
          {event.toolResponse !== undefined && <ResponseBlock response={event.toolResponse} />}
        </div>
      )}
    </div>
  );
}

function ResponseBlock({ response }: { response: string }) {
  const trimmed = response.trim();
  const isJson = trimmed.startsWith("{") || trimmed.startsWith("[");
  return <DetailBlock language={isJson ? "json" : "text"} source={response} />;
}

function DetailBlock({ language, source }: { language: string; source: string }): ReactNode {
  return (
    <div className="overflow-x-auto text-xs">
      <CodeBlock language={language} source={source} />
    </div>
  );
}

function MessageBody({ event, label }: { event: SessionEvent; label: string }) {
  return (
    <div>
      <div className="mb-0.5 text-xs font-medium text-muted-foreground">{label}</div>
      <div className="whitespace-pre-wrap break-words leading-relaxed text-foreground">{event.text}</div>
    </div>
  );
}

function ThinkingBody({ event }: { event: SessionEvent }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="not-prose">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <span className="italic">Reasoning</span>
        <Icon icon={UiChevronDown} className={cn("size-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-1 whitespace-pre-wrap break-words border-l-2 border-border pl-density-3 text-xs italic leading-relaxed text-muted-foreground">
          {event.text}
        </div>
      )}
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
