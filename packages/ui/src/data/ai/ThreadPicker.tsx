import { useCallback, useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { DropdownMenu } from "../../overlay/DropdownMenu";
import { Icon } from "../Icon";
import {
  UiComment,
  UiAdd,
  UiTrash,
  UiChevronDown,
  UiPencilSimpleLine,
} from "../../icons";

/** One conversation as returned by the sessions endpoint. Only `id` is required;
 *  `title`/cost are rendered when present so the picker works against minimal
 *  backends (e.g. clicky's in-memory ThreadStore, which has no cost). */
export interface ThreadSummary {
  id: string;
  title?: string | null;
  totalCostUsd?: number | null;
  updatedAt?: string;
}

/** An injectable thread data source, for apps that load conversations through
 *  their own client (e.g. react-query) rather than a plain `${api}` fetch — and
 *  for backend-free stories/demos. When supplied it replaces the `api` calls. */
export interface ThreadSource {
  /** Returns the conversation list (re-invoked whenever the menu opens). */
  load: () => Promise<ThreadSummary[]>;
  /** Creates a durable conversation before its first message is sent. */
  create?: () => Promise<ThreadSummary>;
  /** Deletes a conversation. Omit to hide the delete affordance's effect. */
  remove?: (id: string) => Promise<void>;
  /** Renames a conversation. Omit to hide the rename affordance. */
  rename?: (id: string, title: string) => Promise<void>;
}

export type ThreadPickerProps = {
  /** Currently selected thread, or null for an unsaved/new conversation. */
  threadId: string | null;
  onSelect: (threadId: string) => void;
  onNew: () => void;
  /** Base endpoint for session CRUD. GET lists, `${api}/${id}` DELETE removes
   *  and PATCH renames. Defaults to Captain's "/api/chat/sessions". Ignored when
   *  `source` is set. */
  api?: string;
  /** Inject the thread list/delete/rename directly instead of fetching `api`. */
  source?: ThreadSource;
  /** Optional query string appended to the list request (e.g. a scope id). */
  query?: string;
  /** Changing this refetches the list, so a title the backend derived during a
   *  turn appears without reopening the menu. */
  refreshToken?: number;
  className?: string;
};

/** A dropdown to switch between, create, and delete conversation threads. The
 *  list is (re)fetched whenever the menu opens, so newly-persisted threads
 *  appear without a manual refresh. */
export function ThreadPicker({
  threadId,
  onSelect,
  onNew,
  api = "/api/chat/sessions",
  source,
  query,
  refreshToken,
  className = "",
}: ThreadPickerProps) {
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [renaming, setRenaming] = useState<{ id: string; title: string }>();
  const canRename = source ? Boolean(source.rename) : Boolean(api);

  const listUrl = query ? `${api}?${query}` : api;

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    try {
      if (source) {
        setThreads(await source.load());
      } else {
        const res = await fetch(listUrl);
        if (res.ok) setThreads(await res.json());
      }
    } catch (err) {
      console.warn("clicky-ui: failed to load threads", err);
    } finally {
      setLoading(false);
    }
  }, [source, listUrl]);

  useEffect(() => {
    void fetchThreads();
  }, [fetchThreads, refreshToken]);

  const commitRename = useCallback(async () => {
    if (!renaming) return;
    const { id, title } = renaming;
    setRenaming(undefined);
    const trimmed = title.trim();
    const previous = threads.find((t) => t.id === id)?.title ?? null;
    if (!trimmed || trimmed === previous) return;
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: trimmed } : t)),
    );
    try {
      if (source) {
        await source.rename?.(id, trimmed);
      } else {
        const res = await fetch(`${api}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: trimmed }),
        });
        if (!res.ok) throw new Error(`rename failed with status ${res.status}`);
      }
    } catch (err) {
      console.warn("clicky-ui: failed to rename thread", err);
      setThreads((prev) =>
        prev.map((t) => (t.id === id ? { ...t, title: previous } : t)),
      );
    }
  }, [api, renaming, source, threads]);

  const handleDelete = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        if (source) {
          await source.remove?.(id);
        } else {
          await fetch(`${api}/${id}`, { method: "DELETE" });
        }
        setThreads((prev) => prev.filter((t) => t.id !== id));
        if (id === threadId) onNew();
      } catch (err) {
        console.warn("clicky-ui: failed to delete thread", err);
      }
    },
    [source, api, threadId, onNew],
  );

  const current = threads.find((t) => t.id === threadId);
  const label = current?.title || "New Chat";

  return (
    <DropdownMenu
      align="left"
      className={className}
      onOpenChange={(open) => {
        if (open) void fetchThreads();
      }}
      menuClassName="min-w-[220px] max-w-[320px] max-h-72 overflow-y-auto"
      trigger={
        <button
          type="button"
          className="flex max-w-[200px] items-center gap-1 truncate rounded px-2 py-1 text-sm font-medium hover:bg-muted"
        >
          <Icon icon={UiComment} className="size-3.5 shrink-0" />
          <span className="truncate">{label}</span>
          <Icon icon={UiChevronDown} className="size-3 shrink-0 opacity-50" />
        </button>
      }
    >
      {(closeMenu) => (
        <div className="py-1">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-popover-foreground hover:bg-accent"
            onClick={() => {
              onNew();
              closeMenu();
            }}
          >
            <Icon icon={UiAdd} className="size-3" /> New Chat
          </button>
          <div className="my-1 border-t border-border" />
          {loading && threads.length === 0 && (
            <div className="px-3 py-1.5 text-xs text-muted-foreground">
              Loading…
            </div>
          )}
          {threads.length === 0 && !loading && (
            <div className="px-3 py-1.5 text-xs text-muted-foreground">
              No previous conversations
            </div>
          )}
          {threads.map((t) => (
            <div
              key={t.id}
              role="button"
              tabIndex={0}
              className={cn(
                "group/thread flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-accent",
                t.id === threadId && "font-semibold",
              )}
              onClick={() => {
                onSelect(t.id);
                closeMenu();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(t.id);
                  closeMenu();
                }
              }}
            >
              <Icon icon={UiComment} className="size-3 shrink-0" />
              {renaming?.id === t.id ? (
                <input
                  autoFocus
                  aria-label="Conversation title"
                  className="flex-1 rounded border border-border bg-background px-1 py-0.5 text-xs"
                  value={renaming.title}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    setRenaming({ id: t.id, title: e.target.value })
                  }
                  onBlur={() => setRenaming(undefined)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") void commitRename();
                    if (e.key === "Escape") setRenaming(undefined);
                  }}
                />
              ) : (
                <span className="flex-1 truncate">{t.title || "Untitled"}</span>
              )}
              {t.totalCostUsd != null && t.totalCostUsd > 0 && (
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  ${t.totalCostUsd.toFixed(2)}
                </span>
              )}
              {canRename && renaming?.id !== t.id && (
                <button
                  type="button"
                  aria-label="Rename conversation"
                  className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 hover:text-foreground group-hover/thread:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenaming({ id: t.id, title: t.title ?? "" });
                  }}
                >
                  <Icon icon={UiPencilSimpleLine} className="size-3" />
                </button>
              )}
              <button
                type="button"
                aria-label="Delete conversation"
                className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 hover:text-destructive group-hover/thread:opacity-100"
                onClick={(e) => void handleDelete(t.id, e)}
              >
                <Icon icon={UiTrash} className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </DropdownMenu>
  );
}
