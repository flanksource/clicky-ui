import { useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import { useDensityValue, type Density } from "../../hooks/use-density";
import { DensityValueProvider } from "../../hooks/density-provider";
import { UiRobotAi } from "../../icons";
import {
  getSessionMetadata,
  normalizeSession,
  summarizeSession,
  type SessionEvent,
  type SessionInput,
} from "./SessionViewer.model";
import {
  collapseWaitRuns,
  isSessionEventGroup,
} from "./SessionViewer.grouping";
import { SessionRow, WaitGroupRow } from "./SessionViewer.rows";
import { SessionMetadataBadges } from "./SessionViewer.header";
import {
  collectSessionFilters,
  isEventVisible,
  type SessionCategory,
} from "./session-categories";
import {
  SessionViewerMenu,
  type SessionThemeOverride,
} from "./SessionViewerMenu";
import { useSessionScroll } from "./use-session-scroll";

export type {
  SessionEntry,
  SessionEvent,
  SessionInput,
  SessionActionMeta,
} from "./SessionViewer.model";
export type { SessionThemeOverride } from "./SessionViewerMenu";

export interface SessionPendingTool {
  tool: string;
  input?: Record<string, unknown>;
  toolCallId?: string;
  approvalId?: string;
  sessionId?: string;
}

export interface SessionToolDecision {
  event: SessionEvent;
  allow: boolean;
  message?: string;
  answers?: Record<string, string | string[]>;
}

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
  /** Show context usage in the summary header. Defaults to true. */
  showContextMeter?: boolean;
  /** Show the 3-dot menu (density + category/tool/source filters). Defaults to true. */
  showMenu?: boolean;
  /** Controls rendered beside the 3-dot menu in the summary header. */
  headerActions?: ReactNode;
  /** Portal the 3-dot menu into this element instead of rendering it inline in
   *  the summary header — lets a host place the menu in its own toolbar while the
   *  filter/density state stays owned by the viewer. Ignored when `showMenu` is
   *  false; falls back to inline rendering when null/undefined. */
  menuContainer?: Element | null;
  /** Initial density override; undefined inherits the page/document density. */
  defaultDensity?: Density;
  /** Initial theme override; undefined inherits the page/document `data-theme`. */
  defaultTheme?: SessionThemeOverride;
  /** Own an internal scroll container that fills its parent's height: render only
   *  the newest screenful, stay pinned to the bottom (most recent activity), and
   *  backfill older rows as the reader scrolls up. Off by default, so inline
   *  consumers keep rendering the whole log in normal page flow. Requires a
   *  height-bounded parent. */
  scrollable?: boolean;
  /** Rows rendered on first paint in `scrollable` mode. Defaults to 60. */
  windowSize?: number;
  /** Rows added each time older content loads in `scrollable` mode. Defaults to 40. */
  batchSize?: number;
  /** Show per-row timestamp/source/model/turn/agent metadata. Defaults to false. */
  showRowMetadata?: boolean;
  /** Show a per-row raw JSON payload expander when available. Defaults to false. */
  showRaw?: boolean;
  /** Render content before each assistant message body. */
  renderMessageBadge?: (event: SessionEvent) => ReactNode;
  pendingTools?: readonly SessionPendingTool[];
  onPendingToolDecision?:
    | ((decision: SessionToolDecision) => Promise<void> | void)
    | undefined;
}

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
 * chat. Shell commands render inline as bash blocks and file ops as their
 * cwd-relative path — the icon carries the verb. Tool responses expand behind
 * a chevron, rendered bare (no panel chrome). The "3-dot" menu mirrors
 * `captain history` filtering — toggle density and hide categories, tools or
 * sources.
 */
export function SessionViewer({
  session,
  className,
  defaultExpanded = false,
  showThinking = true,
  showHeader = true,
  showContextMeter = true,
  showMenu = true,
  headerActions,
  menuContainer,
  defaultDensity,
  defaultTheme,
  scrollable = false,
  windowSize = 60,
  batchSize = 40,
  showRowMetadata = false,
  showRaw = false,
  renderMessageBadge,
  pendingTools = [],
  onPendingToolDecision,
}: SessionViewerProps) {
  const allEvents = useMemo(
    () => mergePendingTools(normalizeSession(session), pendingTools),
    [session, pendingTools],
  );
  // TEMP: debug
  console.log(allEvents);
  const displayItems = useMemo(() => collapseWaitRuns(allEvents), [allEvents]);
  const metadata = useMemo(() => getSessionMetadata(session), [session]);

  const pageDensity = useDensityValue();
  const [densityOverride, setDensityOverride] = useState<Density | undefined>(
    defaultDensity,
  );
  const [themeOverride, setThemeOverride] = useState<
    SessionThemeOverride | undefined
  >(defaultTheme);
  const [hiddenCategories, setHiddenCategories] = useState<
    ReadonlySet<SessionCategory>
  >(() => new Set());
  const [hiddenTools, setHiddenTools] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [hiddenSources, setHiddenSources] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  // Undefined = follow the `showThinking` prop; the menu toggle sets an override.
  const [showThinkingOverride, setShowThinkingOverride] = useState<
    boolean | undefined
  >(undefined);
  const effectiveShowThinking = showThinkingOverride ?? showThinking;

  const filters = useMemo(() => collectSessionFilters(allEvents), [allEvents]);
  const hasThinking = useMemo(
    () => allEvents.some((e) => e.kind === "thinking"),
    [allEvents],
  );

  const visibility = {
    hiddenCategories,
    hiddenTools,
    hiddenSources,
    showThinking: effectiveShowThinking,
  };
  const items = displayItems.filter((item) =>
    isEventVisible(
      isSessionEventGroup(item) ? item.representative : item,
      visibility,
    ),
  );

  // Reset the window when the underlying session changes, not on filter toggles —
  // so hiding a category doesn't yank the reader back to the bottom.
  const resetKey = `${allEvents.length}:${allEvents[0]?.id ?? ""}`;
  const { scrollRef, contentRef, startIndex } = useSessionScroll({
    total: items.length,
    enabled: scrollable,
    windowSize,
    batchSize,
    resetKey,
  });
  // TEMP: debug
  console.log({ startIndex, itemTexts: items.map((item) => item.text) });

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

  const menu = showMenu ? (
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
      onToggleSource={(source) =>
        setHiddenSources((set) => toggleInSet(set, source))
      }
      showThinking={effectiveShowThinking}
      onToggleThinking={() => setShowThinkingOverride(!effectiveShowThinking)}
      hasThinking={hasThinking}
    />
  ) : null;
  // When a host supplies `menuContainer`, the menu is portaled into it (e.g. the
  // host's own toolbar) and the inline header collapses to just its summary.
  const inlineMenu = menu && !menuContainer;

  const list =
    items.length === 0 ? (
      <div className="rounded-md border border-dashed border-border p-density-4 text-center text-sm text-muted-foreground">
        All actions are hidden by the active filters.
      </div>
    ) : (
      // In scrollable mode only the newest `startIndex..` slice is mounted; `last`
      // is measured against the full length so the timeline connector stays right.
      <ol className="relative">
        {items.slice(startIndex).map((item, index) => {
          const last = startIndex + index === items.length - 1;
          return isSessionEventGroup(item) ? (
            <WaitGroupRow
              key={item.id}
              group={item}
              last={last}
              defaultExpanded={defaultExpanded}
              showRowMetadata={showRowMetadata}
              showRaw={showRaw}
              renderMessageBadge={renderMessageBadge}
              onPendingToolDecision={onPendingToolDecision}
            />
          ) : (
            <SessionRow
              key={item.id}
              event={item}
              last={last}
              defaultExpanded={defaultExpanded}
              showRowMetadata={showRowMetadata}
              showRaw={showRaw}
              renderMessageBadge={renderMessageBadge}
              onPendingToolDecision={onPendingToolDecision}
            />
          );
        })}
      </ol>
    );

  return (
    <div
      className={cn(
        "bg-background text-sm text-foreground data-[theme=dark]:bg-[var(--fs-bg-subtle)] [[data-theme=dark]_&]:bg-[var(--fs-bg-subtle)]",
        scrollable && "flex h-full min-h-0 flex-col",
        className,
      )}
      {...dataAttrs}
    >
      <DensityValueProvider density={effectiveDensity}>
        {menu && menuContainer && createPortal(menu, menuContainer)}
        {(showHeader || headerActions || inlineMenu) && (
          <div
            className={cn(
              "flex items-center justify-between gap-density-3",
              scrollable
                ? "shrink-0 border-b border-border px-density-4 py-density-2 md:px-density-6"
                : "mb-density-3",
            )}
          >
            {showHeader && (
              <div className="flex flex-wrap items-center gap-x-density-3 gap-y-1 text-xs text-muted-foreground">
                {summary.model && (
                  <span className="inline-flex items-center gap-1 font-medium text-foreground">
                    <Icon icon={UiRobotAi} className="size-3.5" />
                    {summary.model}
                  </span>
                )}
                <span>{summary.toolCount} actions</span>
                <span>{summary.messageCount} messages</span>
                {metadata && (
                  <SessionMetadataBadges
                    metadata={metadata}
                    showContextMeter={showContextMeter}
                  />
                )}
              </div>
            )}
            {(headerActions || inlineMenu) && (
              <div
                role="group"
                aria-label="Session viewer actions"
                className="ml-auto flex min-w-0 shrink-0 items-center gap-density-2"
              >
                {headerActions}
                {inlineMenu && menu}
              </div>
            )}
          </div>
        )}

        {scrollable ? (
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
            <div ref={contentRef} className="p-density-4 md:p-density-6">
              {list}
            </div>
          </div>
        ) : (
          list
        )}
      </DensityValueProvider>
    </div>
  );
}

function mergePendingTools(
  events: SessionEvent[],
  pendingTools: readonly SessionPendingTool[],
): SessionEvent[] {
  const merged = [...events];
  for (const [index, pending] of pendingTools.entries()) {
    const matches = merged.filter(
      (event) =>
        event.kind === "tool" &&
        ((pending.toolCallId && event.toolCallId === pending.toolCallId) ||
          (pending.approvalId && event.approvalId === pending.approvalId) ||
          (pending.sessionId &&
            event.sessionId === pending.sessionId &&
            event.tool === pending.tool)),
    );
    const match = matches.length === 1 ? matches[0] : undefined;
    if (match) {
      Object.assign(match, {
        pending: true,
        toolInput: pending.input ?? match.toolInput,
        toolCallId: pending.toolCallId ?? match.toolCallId,
        approvalId: pending.approvalId ?? match.approvalId,
        sessionId: pending.sessionId ?? match.sessionId,
      });
    } else {
      merged.push({
        id: `pending-${
          pending.approvalId ?? pending.toolCallId ?? `${pending.tool}-${index}`
        }`,
        kind: "tool",
        tool: pending.tool,
        ...(pending.input ? { toolInput: pending.input } : {}),
        ...(pending.toolCallId ? { toolCallId: pending.toolCallId } : {}),
        ...(pending.approvalId ? { approvalId: pending.approvalId } : {}),
        ...(pending.sessionId ? { sessionId: pending.sessionId } : {}),
        pending: true,
      });
    }
  }
  return merged;
}
