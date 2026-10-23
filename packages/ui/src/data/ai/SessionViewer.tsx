import { useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import { Button } from "../../components/button";
import { useDensityValue, type Density } from "../../hooks/use-density";
import { DensityValueProvider } from "../../hooks/density-provider";
import { UiArrowDown, UiRobotAi } from "../../icons";
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
  isEncryptedReasoning,
  isEventVisible,
  type SessionCategory,
} from "./session-categories";
import {
  SessionViewerMenu,
  type SessionThemeOverride,
} from "./SessionViewerMenu";
import { useSessionScroll } from "./use-session-scroll";
import {
  mergePendingTools,
  type SessionPendingTool,
} from "./SessionViewer.pending-tools";
import type { ApprovalDecisionFields } from "./approval-request";
import type { SessionTokenSizer } from "./session-token-sizing";
import {
  SessionTokenContext,
  useSessionTokenSizing,
} from "./use-session-token-sizing";
export type {
  SessionTokenSizer,
  SessionTokenSize,
  SessionTokenSizingRequest,
  SessionTokenSizingResult,
} from "./session-token-sizing";

export type {
  SessionEntry,
  SessionEvent,
  SessionInput,
  SessionActionMeta,
} from "./SessionViewer.model";
export type { SessionThemeOverride } from "./SessionViewerMenu";
export type { SessionPendingTool } from "./SessionViewer.pending-tools";

/** A decision on one pending tool. `allow`/`message`/`answers` are the original
 *  fields; `interrupt`, `scope`, `grants` and `content` are set only for a typed
 *  request that offers them. */
export interface SessionToolDecision extends ApprovalDecisionFields {
  event: SessionEvent;
  allow: boolean;
  message?: string;
}

export interface SessionViewerProps {
  /** Explicit menu actions only; never invoked automatically when a transcript loads. */
  sizeTokens?: SessionTokenSizer;
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
  /** Host controls rendered at the top of the 3-dot menu. */
  menuHeader?: ReactNode;
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
  /** Optional short title that collapses the first user prompt until opened. */
  initialPromptSummary?: string;
  /** Place transcript navigation in a persistent toolbar. Defaults to floating. */
  scrollControls?: "floating" | "toolbar";
  /** Rows rendered on first paint in `scrollable` mode. Defaults to 60. */
  windowSize?: number;
  /** Rows added each time older content loads in `scrollable` mode. Defaults to 40. */
  batchSize?: number;
  /** Stable identity used to reset the transcript window when switching sessions. */
  scrollResetKey?: string;
  /** `scrollable` mode: called when the reader scrolls to the top with every
   *  row already rendered, to fetch older history. Prepended rows keep the
   *  reader's position. */
  onReachStart?: () => void;
  /** Shows a "Loading earlier messages…" row above the transcript. */
  loadingOlder?: boolean;
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
  menuHeader,
  menuContainer,
  defaultDensity,
  defaultTheme,
  scrollable = false,
  initialPromptSummary,
  scrollControls = "floating",
  windowSize = 60,
  batchSize = 40,
  scrollResetKey,
  onReachStart,
  loadingOlder = false,
  showRowMetadata = false,
  showRaw = false,
  renderMessageBadge,
  pendingTools = [],
  onPendingToolDecision,
  sizeTokens,
}: SessionViewerProps) {
  const allEvents = useMemo(
    () => mergePendingTools(normalizeSession(session), pendingTools),
    [session, pendingTools],
  );
  const displayItems = useMemo(() => collapseWaitRuns(allEvents), [allEvents]);
  const metadata = useMemo(() => getSessionMetadata(session), [session]);
  const tokenSizing = useSessionTokenSizing(session, allEvents, sizeTokens);

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
  const [showEncryptedReasoning, setShowEncryptedReasoning] = useState(false);
  const [showEstimatedToolCost, setShowEstimatedToolCost] = useState(false);

  const filters = useMemo(() => collectSessionFilters(allEvents), [allEvents]);
  const hasThinking = useMemo(
    () => allEvents.some((e) => e.kind === "thinking"),
    [allEvents],
  );
  const hasEncryptedReasoning = useMemo(
    () => allEvents.some(isEncryptedReasoning),
    [allEvents],
  );

  const visibility = {
    hiddenCategories,
    hiddenTools,
    hiddenSources,
    showThinking: effectiveShowThinking,
  };
  const items = displayItems.filter((item) => {
    const event = isSessionEventGroup(item) ? item.representative : item;
    return (
      (showEncryptedReasoning || !isEncryptedReasoning(event)) &&
      isEventVisible(event, visibility)
    );
  });
  const firstUserEventId = allEvents.find((event) => event.kind === "user")?.id;

  // Reset the window when the underlying session changes, not on filter toggles —
  // so hiding a category doesn't yank the reader back to the bottom.
  const resetKey = scrollResetKey ?? allEvents[0]?.id ?? "";
  const {
    scrollRef,
    contentRef,
    startIndex,
    following,
    jumpToStart,
    resumeFollowing,
  } = useSessionScroll({
    total: items.length,
    enabled: scrollable,
    windowSize,
    batchSize,
    resetKey,
    ...(allEvents[0] ? { firstKey: allEvents[0].id } : {}),
    ...(onReachStart ? { onReachStart } : {}),
  });

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
      menuHeader={menuHeader}
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
      hasEncryptedReasoning={hasEncryptedReasoning}
      showEncryptedReasoning={showEncryptedReasoning}
      onToggleEncryptedReasoning={() =>
        setShowEncryptedReasoning((shown) => !shown)
      }
      showEstimatedToolCost={showEstimatedToolCost}
      onToggleEstimatedToolCost={() =>
        setShowEstimatedToolCost((shown) => !shown)
      }
      {...(tokenSizing.estimateAll
        ? {
            onEstimateTokens: tokenSizing.estimateAll,
            onCalculateMissingTokens: tokenSizing.calculateMissing,
            estimatingTokens: tokenSizing.pending,
          }
        : {})}
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
              showEstimatedToolCost={showEstimatedToolCost}
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
              initialPrompt={item.id === firstUserEventId}
              {...(item.id === firstUserEventId && initialPromptSummary
                ? { initialPromptSummary }
                : {})}
              showEstimatedToolCost={showEstimatedToolCost}
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
        "@container/session-viewer min-w-0 bg-background text-sm text-foreground data-[theme=dark]:bg-[var(--fs-bg-subtle)] [[data-theme=dark]_&]:bg-[var(--fs-bg-subtle)]",
        scrollable && "flex h-full min-h-0 flex-col",
        className,
      )}
      {...dataAttrs}
    >
      <SessionTokenContext.Provider value={tokenSizing.context}>
        <DensityValueProvider density={effectiveDensity}>
          {menu && menuContainer && createPortal(menu, menuContainer)}
          {(showHeader || headerActions || inlineMenu) && (
            <div
              data-session-viewer-header
              className={cn(
                "flex min-w-0 flex-wrap items-center justify-between gap-x-density-3 gap-y-density-2",
                scrollable
                  ? "shrink-0 border-b border-border px-density-3 py-density-2 @min-[48rem]/session-viewer:px-density-4"
                  : "mb-density-3",
              )}
            >
              {showHeader && (
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-density-3 gap-y-1 text-xs text-muted-foreground">
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

          {scrollable && scrollControls === "toolbar" && (
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-density-3 py-1.5 text-xs">
              <span className="text-muted-foreground">Oldest → newest</span>
              <div className="flex items-center gap-1">
                {firstUserEventId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={jumpToStart}
                    className="h-7 px-2 text-xs"
                  >
                    Initial prompt
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resumeFollowing}
                  className="h-7 gap-1 px-2 text-xs"
                >
                  <Icon icon={UiArrowDown} className="size-3.5" />
                  Latest
                </Button>
              </div>
            </div>
          )}
          {scrollable ? (
            <div className="relative min-h-0 flex-1">
              <div ref={scrollRef} className="h-full overflow-y-auto">
                <div
                  ref={contentRef}
                  data-session-viewer-content
                  className="p-density-3 @min-[48rem]/session-viewer:p-density-4"
                >
                  {loadingOlder ? (
                    <p
                      role="status"
                      className="pb-density-2 text-center text-xs text-muted-foreground"
                    >
                      Loading earlier messages…
                    </p>
                  ) : null}
                  {list}
                </div>
              </div>
              {scrollControls === "floating" && !following && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={resumeFollowing}
                  className="absolute bottom-density-3 left-1/2 -translate-x-1/2 shadow-md"
                >
                  <Icon icon={UiArrowDown} className="size-4" />
                  Scroll to bottom
                </Button>
              )}
            </div>
          ) : (
            list
          )}
        </DensityValueProvider>
      </SessionTokenContext.Provider>
    </div>
  );
}
