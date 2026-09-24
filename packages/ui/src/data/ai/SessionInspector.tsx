import { useMemo, useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { SessionInspectorPanel } from "./SessionInspector.panels";
import { SessionInspectorHeader } from "./SessionInspector.summary";
import { CompactSessionInspectorToolbar } from "./SessionInspector.compact";
import { InspectorTabs } from "./SessionInspector.tabs";
import {
  hasStructuredOutput,
  inspectorTabs,
  type SessionInspectorTab,
} from "./SessionInspector.tabs.model";
import { SessionTranscript } from "./SessionInspector.transcript";
import {
  isSessionCollectionInput,
  type SessionCollectionInput,
  type SessionCollectionItem,
  type SessionInspectorInput,
} from "./SessionInspector.collection";
import {
  SessionHierarchyPicker,
  SessionHierarchyTree,
} from "./SessionInspector.hierarchy";
import { useSessionHierarchy } from "./SessionInspector.hierarchy-state";
import { type ApprovalResolveHandler } from "./SessionInspector.approvals-model";
import { LegacySessionInspector } from "./SessionInspector.legacy";
import { useInspectorTab } from "./SessionInspector.tab-state";
import {
  useRemoteCollection,
  useRemoteSession,
} from "./SessionInspector.remote";
import { RemoteSessionStatus } from "./SessionInspector.remote-view";
import type { SessionViewerProps } from "./SessionViewer";
import {
  getSessionMetadata,
  type SessionInput,
  type SessionMetadataSummary,
} from "./SessionViewer.model";
import type { UnifiedSessionInput } from "./SessionViewer.unified";

export type { SessionInspectorTab } from "./SessionInspector.tabs.model";

/**
 * Either an in-memory `session` or a session URL `src` (never both — the
 * types forbid it and the component throws). With `src` the inspector fetches
 * the session and follows it while it is live; see `SessionInput` for the URL
 * contract. `follow` forces (`true`) or suppresses (`false`) the live stream
 * for `src` and for collection items that carry `src`.
 */
export type SessionInspectorProps = SessionInspectorOptions &
  (
    | { session: SessionInspectorInput; src?: never; follow?: boolean }
    | { src: string; session?: never; follow?: boolean }
  );

export interface SessionInspectorOptions {
  className?: string;
  /** Compact keeps tabs, runtime context, host actions, and session options on one line. */
  layout?: "default" | "compact";
  /** Runtime metadata to display in the compact context bar. Defaults to session metadata. */
  metadata?: SessionMetadataSummary;
  /** Host controls rendered before Session options in the compact toolbar. */
  toolbarActions?: ReactNode;
  defaultTab?: SessionInspectorTab;
  /** Controlled active tab (e.g. from the URL); pair with `onTabChange`. */
  tab?: SessionInspectorTab;
  onTabChange?: (tab: SessionInspectorTab) => void;
  /** Controlled session-level selection of a session collection; `[]` selects
   *  nothing. Omit to start from the collection's defaults. */
  selectedSessionIds?: readonly string[];
  onSelectedSessionIdsChange?: (ids: string[]) => void;
  transcriptProps?: Omit<SessionViewerProps, "session">;
  renderSessionActions?: (item: SessionCollectionItem) => ReactNode;
  /** Receives edits made in the Plan tab. The inspector also keeps the draft visible locally. */
  onPlanChange?: (content: string) => void;
  /** Resolves one pending tool approval from the Approvals tab. Omitted, the
   *  tab still lists pending requests but renders no Approve/Deny controls. */
  onResolveApproval?: ApprovalResolveHandler;
  composer?: ReactNode;
}

export function SessionInspector({
  session,
  src,
  follow,
  className,
  ...options
}: SessionInspectorProps) {
  if (session !== undefined && src !== undefined) {
    throw new Error(
      "SessionInspector takes either `session` or `src`, not both",
    );
  }
  if (session === undefined && src === undefined) {
    throw new Error("SessionInspector requires a `session` or a `src`");
  }
  const followOptions = follow === undefined ? {} : { follow };
  const remote = useRemoteSession(src, followOptions);
  const collection =
    session !== undefined && isSessionCollectionInput(session)
      ? session
      : undefined;
  const remoteCollection = useRemoteCollection(collection, followOptions);
  const status = src !== undefined ? remote : remoteCollection;
  const resolved: SessionInspectorInput | undefined =
    src !== undefined
      ? remote.session
      : collection
        ? remoteCollection.collection
        : session;

  // A URL-backed inspector always renders inside the status wrapper, so an
  // error arriving mid-follow adds the alert without remounting the view.
  const remoteBacked =
    src !== undefined ||
    (collection !== undefined && remoteCollection.collection !== collection);
  if (resolved && !remoteBacked) {
    return (
      <SessionInspectorView
        session={resolved}
        {...followOptions}
        {...options}
        {...(className ? { className } : {})}
      />
    );
  }
  return (
    <RemoteSessionStatus
      loading={status.loading}
      {...(status.error ? { error: status.error } : {})}
      {...(className ? { className } : {})}
    >
      {resolved ? (
        <SessionInspectorView
          session={resolved}
          {...followOptions}
          {...options}
        />
      ) : null}
    </RemoteSessionStatus>
  );
}

function SessionInspectorView({
  session,
  follow,
  className,
  defaultTab = "transcript",
  tab,
  onTabChange,
  selectedSessionIds,
  onSelectedSessionIdsChange,
  transcriptProps,
  renderSessionActions,
  onPlanChange,
  onResolveApproval,
  composer,
  layout = "default",
  metadata,
  toolbarActions,
}: SessionInspectorOptions & {
  session: SessionInspectorInput;
  follow?: boolean;
}) {
  const detail = useMemo(
    () =>
      isSessionCollectionInput(session) ? undefined : asUnifiedSession(session),
    [session],
  );
  const collection = useMemo(
    () =>
      isSessionCollectionInput(session)
        ? session
        : detail
          ? singleSessionCollection(detail)
          : undefined,
    [detail, session],
  );

  const tabProps = {
    ...(tab ? { tab } : {}),
    ...(onTabChange ? { onTabChange } : {}),
  };

  if (collection) {
    const optionalProps = {
      ...tabProps,
      ...(follow === undefined ? {} : { follow }),
      ...(selectedSessionIds ? { selectedSessionIds } : {}),
      ...(onSelectedSessionIdsChange ? { onSelectedSessionIdsChange } : {}),
      ...(className ? { className } : {}),
      ...(transcriptProps ? { transcriptProps } : {}),
      ...(renderSessionActions ? { renderSessionActions } : {}),
      ...(onPlanChange ? { onPlanChange } : {}),
      ...(onResolveApproval ? { onResolveApproval } : {}),
      ...(composer ? { composer } : {}),
      ...(layout === "compact" ? { layout } : {}),
      ...(metadata ? { metadata } : {}),
      ...(toolbarActions ? { toolbarActions } : {}),
    };
    return (
      <CollectionSessionInspector
        collection={collection}
        defaultTab={defaultTab}
        {...optionalProps}
      />
    );
  }

  return (
    <LegacySessionInspector
      session={session as SessionInput}
      defaultTab={defaultTab}
      {...tabProps}
      {...(className ? { className } : {})}
      {...(transcriptProps ? { transcriptProps } : {})}
      {...(composer ? { composer } : {})}
      {...(layout === "compact" ? { layout } : {})}
      {...(metadata ? { metadata } : {})}
      {...(toolbarActions ? { toolbarActions } : {})}
    />
  );
}

function CollectionSessionInspector({
  collection,
  follow,
  className,
  defaultTab = "transcript",
  tab: controlledTab,
  onTabChange,
  selectedSessionIds,
  onSelectedSessionIdsChange,
  transcriptProps,
  renderSessionActions,
  onPlanChange,
  onResolveApproval,
  composer,
  layout = "default",
  metadata,
  toolbarActions,
}: SessionInspectorOptions & {
  collection: SessionCollectionInput;
  follow?: boolean;
}) {
  const hierarchy = useSessionHierarchy(collection, {
    ...(selectedSessionIds ? { selectedSessionIds } : {}),
    ...(onSelectedSessionIdsChange ? { onSelectedSessionIdsChange } : {}),
    ...(follow === undefined ? {} : { follow }),
  });
  const compact = layout === "compact";
  const [menuHost, setMenuHost] = useState<HTMLSpanElement | null>(null);
  const outputVisible = hasStructuredOutput(hierarchy.current);
  const [tab, setTab] = useInspectorTab(
    defaultTab,
    outputVisible,
    controlledTab,
    onTabChange,
  );
  const transcriptClassName = cn("h-full", transcriptProps?.className);
  const panelDetail =
    tab === "costs" || tab === "verification"
      ? hierarchy.filtered
      : hierarchy.current;
  const compactMetadata = metadata ?? getSessionMetadata(hierarchy.current);
  const compactTabs = inspectorTabs(
    outputVisible,
    hierarchy.current,
    hierarchy.filtered,
  );
  const compactMenuHeader = (
    <div className="w-[min(38rem,calc(100vw-4rem))]">
      <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Session content
      </p>
      <SessionHierarchyTree
        collection={collection}
        state={hierarchy}
        {...(renderSessionActions ? { renderSessionActions } : {})}
        className="h-[min(32rem,52vh)]"
      />
      {transcriptProps?.menuHeader ? (
        <div className="mt-1 border-t border-border pt-1">
          {transcriptProps.menuHeader}
        </div>
      ) : null}
    </div>
  );
  const compactTranscriptProps = compact
    ? {
        ...transcriptProps,
        menuContainer: menuHost,
        menuHeader: compactMenuHeader,
        showMenu: menuHost !== null && transcriptProps?.showMenu !== false,
      }
    : transcriptProps;

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full max-w-full flex-col overflow-hidden bg-background text-sm",
        compact
          ? "@container rounded-none border-0 shadow-none"
          : "rounded-xl border border-border shadow-sm",
        className,
      )}
    >
      {compact ? (
        <CompactSessionInspectorToolbar
          tabs={compactTabs}
          activeTab={tab}
          onSelect={(next) => setTab(next as SessionInspectorTab)}
          onMenuHost={setMenuHost}
          {...(compactMetadata ? { metadata: compactMetadata } : {})}
          {...(toolbarActions ? { toolbarActions } : {})}
        />
      ) : (
        <>
          <SessionInspectorHeader session={hierarchy.current} />
          <div
            role="toolbar"
            aria-label="Session content controls"
            className="flex shrink-0 justify-start border-b border-border px-density-2 py-density-2"
          >
            <SessionHierarchyPicker
              collection={collection}
              state={hierarchy}
              {...(renderSessionActions ? { renderSessionActions } : {})}
            />
          </div>
          <InspectorTabs tab={tab} tabs={compactTabs} onSelect={setTab} />
        </>
      )}
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto",
          !compact && "flex flex-col lg:overflow-hidden",
        )}
      >
        <main
          className={cn(
            "flex min-w-0 flex-col",
            compact ? "min-h-0" : "min-h-[28rem] flex-1 lg:min-h-0",
          )}
        >
          {compact ? (
            <>
              <div
                className={cn(
                  "min-h-0 flex-1 overflow-hidden",
                  tab !== "transcript" && "hidden",
                )}
              >
                <SessionTranscript
                  session={hierarchy.filtered}
                  viewerProps={{
                    ...compactTranscriptProps,
                    className: transcriptClassName,
                  }}
                />
              </div>
              {tab !== "transcript" ? (
                <div className="min-h-0 flex-1 overflow-auto p-density-4">
                  <SessionInspectorPanel
                    tab={tab}
                    detail={panelDetail}
                    session={hierarchy.current}
                    {...(onPlanChange ? { onPlanChange } : {})}
                    {...(onResolveApproval ? { onResolveApproval } : {})}
                  />
                </div>
              ) : null}
            </>
          ) : (
            <div
              className={cn(
                "min-h-0 flex-1",
                tab === "transcript"
                  ? "overflow-hidden"
                  : "overflow-auto p-density-4",
              )}
            >
              {tab === "transcript" ? (
                <SessionTranscript
                  session={hierarchy.filtered}
                  viewerProps={{
                    ...transcriptProps,
                    className: transcriptClassName,
                  }}
                />
              ) : (
                <SessionInspectorPanel
                  tab={tab}
                  detail={panelDetail}
                  session={hierarchy.current}
                  {...(onPlanChange ? { onPlanChange } : {})}
                  {...(onResolveApproval ? { onResolveApproval } : {})}
                />
              )}
            </div>
          )}
          {composer ? (
            <div className="shrink-0 border-t border-border p-density-3">
              {composer}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function singleSessionCollection(
  session: UnifiedSessionInput,
): SessionCollectionInput {
  const id = session.id || "session";
  return {
    kind: "session-collection",
    id,
    currentSessionId: id,
    sessions: [{ id, session }],
  };
}

function asUnifiedSession(
  session: SessionInput,
): UnifiedSessionInput | undefined {
  if (typeof session !== "object" || session === null || Array.isArray(session))
    return undefined;
  return session as UnifiedSessionInput;
}
