import { useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "../../components/button";
import type { FilterBarFilter } from "../../components/FilterBar";
import { Badge } from "../../data/Badge";
import { formatRelativeTime } from "../../data/cells/timestamp-format";
import { DataTable, type DataTableColumn } from "../../data/DataTable";
import { Icon } from "../../data/Icon";
import { UiFile, UiGlobe, UiImage } from "../../icons";
import { toneToBadgeTone } from "../comment-utils";
import { DriftBadge } from "../DriftList";
import { DEFAULT_COMMENT_STATUSES, type CommentConfig } from "../comment-types";
import { CommentInboxCopy } from "./CommentInboxCopy";
import { CommentInboxReview } from "./CommentInboxReview";
import { CommentInboxThread, type CommentInboxActions } from "./CommentInboxThread";
import {
  inboxAuthorOptions,
  filterInbox,
  groupInbox,
  inboxItems,
  INBOX_KIND_OPTIONS,
  INBOX_PHASE_OPTIONS,
  inboxProjectOptions,
  resolvedReviewQueue,
  INBOX_STATUS_OPTIONS,
  type InboxFilters,
  type InboxItem,
  type InboxListing,
  type InboxTargetKind,
} from "./inbox-model";

export type CommentInboxProps = {
  /** One listing per scope, as gavel's comments API returns them. `undefined` while the first load is pending. */
  listings: readonly InboxListing[] | undefined;
  /** A failed load or refresh; shown beside the filters and, once there are rows, beside them. */
  error?: string | null | undefined;
  /** Controlled filters, so a host can keep them in the URL. */
  filters: InboxFilters;
  onFiltersChange: (filters: InboxFilters) => void;
  /** Receives the thread with its resolved anchor, for the host to open the file at its line, the page or the image. */
  onOpen: (item: InboxItem) => void;
  /** Where gavel is served; copy-as-prompt points the agent's API calls here. */
  baseUrl: string;
  /** Handlers for acting on a thread. A capability a host does not pass is not offered. */
  actions?: CommentInboxActions;
  /** Statuses and assignees for the thread cards. Defaults to open, in progress, resolved and closed. */
  config?: CommentConfig;
  className?: string;
};

const DEFAULT_CONFIG: CommentConfig = { statuses: DEFAULT_COMMENT_STATUSES };
const KIND_ICON = { file: UiFile, page: UiGlobe, image: UiImage } as const;
const KIND_LABEL: Record<InboxTargetKind, string> = { file: "file", page: "page", image: "image" };

const placeOf = (item: InboxItem) => (item.line === undefined ? item.label : `${item.label}:${item.line}`);

function filterControls(filters: InboxFilters, set: (patch: Partial<InboxFilters>) => void, items: readonly InboxItem[], listings: readonly InboxListing[]): FilterBarFilter[] {
  const choice = (key: "status" | "phase" | "author" | "project" | "kind", label: string, options: { value: string; label: string }[]): FilterBarFilter => ({
    key,
    kind: "enum",
    label,
    value: filters[key],
    options,
    onChange: (value) => set({ [key]: value }),
  });
  return [
    choice("status", "Status", INBOX_STATUS_OPTIONS),
    choice("phase", "Phase", INBOX_PHASE_OPTIONS),
    choice("author", "Author", inboxAuthorOptions(items)),
    choice("project", "Project", inboxProjectOptions(listings)),
    choice("kind", "Target", INBOX_KIND_OPTIONS),
    { key: "unread", kind: "boolean", label: "Unread only", value: filters.unread, onChange: (unread) => set({ unread }) },
  ];
}

function ThreadCell({ item }: { item: InboxItem }) {
  const replies = item.thread.messages?.length ?? 0;
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      {item.thread.unread && (
        <Badge tone="info" variant="soft" size="xs" clickToCopy={false}>
          Unread
        </Badge>
      )}
      <span className="line-clamp-2 min-w-0">{item.thread.bodyMarkdown}</span>
      {replies > 0 && <span className="shrink-0 text-xs text-muted-foreground">{replies === 1 ? "1 reply" : `${replies} replies`}</span>}
    </div>
  );
}

function TargetCell({ item, onOpen }: { item: InboxItem; onOpen: (item: InboxItem) => void }) {
  const drift = item.anchor && item.anchor.state !== "matched" ? item.anchor.state : undefined;
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <Icon icon={KIND_ICON[item.kind]} className="shrink-0 text-muted-foreground" />
      <button
        type="button"
        className="truncate font-mono text-xs text-primary hover:underline"
        aria-label={`Open ${placeOf(item)}`}
        title={`Open ${placeOf(item)}`}
        onClick={(event) => {
          event.stopPropagation();
          onOpen(item);
        }}
      >
        {placeOf(item)}
      </button>
      {drift && <DriftBadge state={drift} />}
    </div>
  );
}

function StatusCell({ status, config }: { status: string; config: CommentConfig }) {
  const configured = config.statuses.find((entry) => entry.value === status);
  return (
    <Badge variant="soft" size="xs" tone={toneToBadgeTone(configured?.tone)} clickToCopy={false}>
      {configured?.label ?? status}
    </Badge>
  );
}

/**
 * Every comment thread across targets, whatever surface wrote it: files, pages
 * and images, grouped by target and newest first behind controlled filters that
 * stay visible when nothing matches. Copy-as-prompt hands the filtered selection
 * to an LLM, Claude or Codex, and the review queue lets a human close resolved
 * work or reopen it with feedback.
 */
export function CommentInbox({ listings, error, filters, onFiltersChange, onOpen, baseUrl, actions = {}, config = DEFAULT_CONFIG, className }: CommentInboxProps) {
  const [reviewing, setReviewing] = useState(false);
  const [reviewId, setReviewId] = useState<string | undefined>();
  const [expanded, setExpanded] = useState<string[]>([]);
  const items = useMemo(() => inboxItems(listings ?? []), [listings]);
  const visible = useMemo(() => groupInbox(filterInbox(items, filters)).flatMap((group) => group.items), [items, filters]);
  const queue = useMemo(() => resolvedReviewQueue(filterInbox(items, { ...filters, status: "resolved" })), [items, filters]);
  const unresolved = items.filter((item) => config.statuses.some((status) => status.value === item.thread.status && status.unresolved)).length;
  // FilterBar's "Clear all" clears each filter in turn within one event, so patches merge onto the latest filters.
  const latest = useRef(filters);
  latest.current = filters;
  const set = (patch: Partial<InboxFilters>) => {
    latest.current = { ...latest.current, ...patch };
    onFiltersChange(latest.current);
  };

  const { onClose, onReopenWithFeedback, onMarkRead } = actions;
  const canReview = onClose !== undefined && onReopenWithFeedback !== undefined;
  const unreadTargets = new Set(items.filter((item) => item.thread.unread).map((item) => `${item.scope}\n${item.uri}`));

  if (reviewing && canReview) {
    return (
      <div className={className} data-testid="comment-inbox-review">
        <CommentInboxReview
          queue={queue}
          selectedId={reviewId}
          config={config}
          actions={{ ...actions, onClose, onReopenWithFeedback }}
          onSelect={setReviewId}
          onOpen={onOpen}
          onExit={() => setReviewing(false)}
        />
      </div>
    );
  }

  const columns: DataTableColumn<InboxItem>[] = [
    { key: "thread", label: "Thread", sortable: false, grow: true, accessor: (item) => item.thread.bodyMarkdown, render: (_value, item) => <ThreadCell item={item} /> },
    { key: "target", label: "Target", sortable: false, accessor: placeOf, render: (_value, item) => <TargetCell item={item} onOpen={onOpen} /> },
    { key: "status", label: "Status", sortable: false, accessor: (item) => item.thread.status, render: (value) => <StatusCell status={String(value)} config={config} /> },
    { key: "phase", label: "Phase", sortable: false, accessor: (item) => item.thread.phase },
    { key: "author", label: "Author", sortable: false, accessor: (item) => item.thread.author.label ?? item.thread.author.id },
    { key: "activity", label: "Updated", sortable: false, accessor: (item) => item.activity, render: (value) => formatRelativeTime(new Date(String(value))) },
  ];

  const groupMeta = (_key: string, rows: InboxItem[]): ReactNode => {
    const first = rows[0];
    if (!first) return null;
    return (
      <span className="flex items-center gap-2">
        <Badge variant="soft" size="xs" clickToCopy={false}>
          {KIND_LABEL[first.kind]}
        </Badge>
        <span>{first.project}</span>
        {unreadTargets.has(`${first.scope}\n${first.uri}`) && (
          <Badge tone="info" variant="soft" size="xs" clickToCopy={false}>
            Unread
          </Badge>
        )}
        {unreadTargets.has(`${first.scope}\n${first.uri}`) && onMarkRead && (
          <Button size="sm" variant="ghost" aria-label={`Mark ${first.label} read`} onClick={() => void onMarkRead({ scope: first.scope, uri: first.uri })}>
            Mark read
          </Button>
        )}
      </span>
    );
  };

  const notReady = listings === undefined;
  return (
    <section aria-label="Comment inbox" className={`flex h-full min-h-0 flex-col gap-3 p-density-3 ${className ?? ""}`} data-testid="comment-inbox">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold">Comments</h1>
          <p className="text-sm text-muted-foreground">{notReady ? "Loading…" : `${unresolved} unresolved across ${listings.length === 1 ? "1 project" : `${listings.length} projects`}`}</p>
        </div>
        <div className="flex flex-wrap items-start gap-2 sm:justify-end">
          {canReview && (
            <Button
              size="sm"
              variant="outline"
              disabled={queue.length === 0}
              onClick={() => {
                setReviewId(queue[0]?.thread.id);
                setReviewing(true);
              }}
            >
              Review resolved ({queue.length})
            </Button>
          )}
          <CommentInboxCopy items={visible} scopes={(listings ?? []).map((listing) => listing.scope)} filters={filters} baseUrl={baseUrl} />
        </div>
      </header>
      {listings && error && (
        <p role="alert" className="text-sm text-destructive">
          Refreshing comments failed: {error}
        </p>
      )}
      <DataTable
        className="min-h-0 flex-1"
        data={visible}
        columns={columns}
        getRowId={(item) => `${item.scope}\n${item.thread.id}`}
        grouping={{ getGroupKey: (item) => `${item.scope}\n${item.uri}`, getGroupLabel: (_key, rows) => rows[0]?.label, getGroupMeta: groupMeta }}
        loading={notReady && !error}
        error={notReady && error ? `Comments could not be loaded: ${error}` : undefined}
        emptyMessage={items.length === 0 ? "No comment threads yet" : "No threads match these filters"}
        manualFilter
        externalSearch={{ value: filters.q, onChange: (q) => set({ q }), placeholder: "Comment text or path…", ariaLabel: "Search comments" }}
        externalFilters={filterControls(filters, set, items, listings ?? [])}
        expandedRowIds={expanded}
        onExpandedRowIdsChange={setExpanded}
        renderExpandedRow={(item) => <CommentInboxThread item={item} config={config} actions={actions} />}
      />
    </section>
  );
}
