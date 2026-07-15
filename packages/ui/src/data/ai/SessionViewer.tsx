import { useMemo, useState } from "react";
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
  type SessionMetadataSummary,
  type SessionInput,
} from "./SessionViewer.model";
import { SessionRow } from "./SessionViewer.rows";
import {
  collectSessionFilters,
  isEventVisible,
  type SessionCategory,
} from "./session-categories";
import { SessionViewerMenu, type SessionThemeOverride } from "./SessionViewerMenu";
import { useSessionScroll } from "./use-session-scroll";

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
  showMenu = true,
  menuContainer,
  defaultDensity,
  defaultTheme,
  scrollable = false,
  windowSize = 60,
  batchSize = 40,
  showRowMetadata = false,
  showRaw = false,
}: SessionViewerProps) {
  const allEvents = useMemo(() => normalizeSession(session), [session]);
  const metadata = useMemo(() => getSessionMetadata(session), [session]);

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

  // Reset the window when the underlying session changes, not on filter toggles —
  // so hiding a category doesn't yank the reader back to the bottom.
  const resetKey = `${allEvents.length}:${allEvents[0]?.id ?? ""}`;
  const { scrollRef, contentRef, startIndex } = useSessionScroll({
    total: events.length,
    enabled: scrollable,
    windowSize,
    batchSize,
    resetKey,
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
  ) : null;
  // When a host supplies `menuContainer`, the menu is portaled into it (e.g. the
  // host's own toolbar) and the inline header collapses to just its summary.
  const inlineMenu = menu && !menuContainer;

  const list =
    events.length === 0 ? (
      <div className="rounded-md border border-dashed border-border p-density-4 text-center text-sm text-muted-foreground">
        All actions are hidden by the active filters.
      </div>
    ) : (
      // In scrollable mode only the newest `startIndex..` slice is mounted; `last`
      // is measured against the full length so the timeline connector stays right.
      <ol className="relative">
        {events.slice(startIndex).map((event, index) => (
          <SessionRow
            key={event.id}
            event={event}
            last={startIndex + index === events.length - 1}
            defaultExpanded={defaultExpanded}
            showRowMetadata={showRowMetadata}
            showRaw={showRaw}
          />
        ))}
      </ol>
    );

  return (
    <div className={cn("text-sm", scrollable && "flex h-full min-h-0 flex-col", className)} {...dataAttrs}>
      <DensityValueProvider density={effectiveDensity}>
        {menu && menuContainer && createPortal(menu, menuContainer)}
        {(showHeader || inlineMenu) && (
          <div
            className={cn(
              "flex items-center justify-between gap-density-3",
              scrollable
                ? "shrink-0 border-b border-border px-density-4 py-density-2 md:px-density-6"
                : "mb-density-3",
            )}
          >
            <div className="flex flex-wrap items-center gap-x-density-3 gap-y-1 text-xs text-muted-foreground">
              {showHeader && summary.model && (
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  <Icon icon={UiRobotAi} className="size-3.5" />
                  {summary.model}
                </span>
              )}
              {showHeader && <span>{summary.toolCount} actions</span>}
              {showHeader && <span>{summary.messageCount} messages</span>}
              {showHeader && metadata && <SessionMetadataBadges metadata={metadata} />}
            </div>
            {inlineMenu && menu}
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

function SessionMetadataBadges({ metadata }: { metadata: SessionMetadataSummary }) {
  const capabilityBadges = [
    countBadge("tool", metadata.capabilities?.tools),
    countBadge("mcp", metadata.capabilities?.pendingMcpServers),
    countBadge("agent", metadata.capabilities?.agents),
    countBadge("skill", metadata.capabilities?.skills),
  ].filter(Boolean) as Array<{ key: string; label: string; title?: string }>;
  const badges: Array<{ key: string; label: string; title?: string }> = [
    ...(metadata.turns?.length ? [{ key: "turns", label: countLabel(metadata.turns.length, "turn") }] : []),
    ...capabilityBadges,
    ...(metadata.context ? [{ key: "context", label: contextLabel(metadata.context) }] : []),
    ...(metadata.budget ? [{ key: "budget", label: budgetLabel(metadata.budget) }] : []),
    ...(metadata.events?.length ? [{ key: "events", label: countLabel(metadata.events.length, "event") }] : []),
  ];
  if (badges.length === 0) return null;
  return (
    <>
      {badges.map((badge) => (
        <span
          key={badge.key}
          title={badge.title}
          className="inline-flex max-w-40 items-center rounded border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground"
        >
          <span className="truncate">{badge.label}</span>
        </span>
      ))}
    </>
  );
}

function countBadge(label: string, values: string[] | undefined) {
  const count = values?.length ?? 0;
  if (!count) return null;
  return { key: label, label: countLabel(count, label), title: values?.join(", ") };
}

function countLabel(count: number, label: string) {
  if (label === "mcp") return `${count} mcp`;
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}

function contextLabel(context: { freePercent: number; usedTokens?: number; windowTokens?: number }) {
  const used = compactNumber(context.usedTokens ?? 0);
  const total = compactNumber(context.windowTokens ?? 0);
  return total ? `ctx ${context.freePercent}% free (${used}/${total})` : `ctx ${context.freePercent}% free`;
}

function budgetLabel(budget: { used?: number; total?: number; remaining?: number }) {
  if (budget.total !== undefined && budget.total > 0) {
    return `budget ${formatUSD(budget.used ?? 0)}/${formatUSD(budget.total)}`;
  }
  if (budget.remaining !== undefined) return `budget ${formatUSD(budget.remaining)} left`;
  if (budget.used !== undefined) return `budget ${formatUSD(budget.used)} used`;
  return "budget";
}

function compactNumber(value: number) {
  if (!value) return "";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return String(value);
}

function formatUSD(value: number) {
  if (value < 1 || !Number.isInteger(value)) return `$${value.toFixed(2)}`;
  return `$${value.toFixed(0)}`;
}
