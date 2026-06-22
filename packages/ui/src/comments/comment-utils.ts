import type { BadgeTone } from "../data/Badge";
import {
  DEFAULT_CHECKLIST_CYCLE,
  type Comment,
  type CommentAnchor,
  type CommentAnchorMeta,
  type CommentAuthor,
  type CommentCallbacks,
  type CommentConfig,
  type CommentFacet,
  type CommentFacetOption,
  type CommentFilters,
  type CommentMention,
  type CommentMentionable,
  type CommentMentionKind,
  type CommentStatusConfig,
  type CommentTone,
  DOCUMENT_ANCHOR,
} from "./comment-types";

/** Human-readable name for an author, falling back to "Unknown". */
export function authorDisplayName(author: CommentAuthor | null): string {
  return author?.name?.trim() || "Unknown";
}

/** Maps a CommentTone onto the Badge component's tone vocabulary. */
export function toneToBadgeTone(tone: CommentTone | undefined): BadgeTone {
  switch (tone) {
    case "success":
      return "success";
    case "danger":
      return "danger";
    case "warning":
      return "warning";
    case "info":
      return "info";
    case "neutral":
    case "default":
    default:
      return "neutral";
  }
}

/** Looks up the status config for a stored status value. */
export function resolveStatusConfig(
  config: CommentConfig,
  value: string | undefined,
): CommentStatusConfig | undefined {
  if (value == null) return undefined;
  return config.statuses.find((s) => s.value === value);
}

/** Looks up a facet option for a stored facet value. */
export function resolveFacetOption(
  facet: CommentFacet,
  value: string | undefined,
): CommentFacetOption | undefined {
  if (value == null) return undefined;
  return facet.options.find((o) => o.value === value);
}

/** The default status value for new comments: first unresolved, else first. */
export function defaultStatusValue(config: CommentConfig): string | undefined {
  const unresolved = config.statuses.find((s) => s.unresolved);
  return (unresolved ?? config.statuses[0])?.value;
}

/** Whether a stored status counts as unresolved/open. */
export function isUnresolved(
  config: CommentConfig,
  status: string | undefined,
): boolean {
  return resolveStatusConfig(config, status)?.unresolved ?? false;
}

/** Returns the root (non-reply) comments in input order. */
export function getRoots(comments: Comment[]): Comment[] {
  return comments.filter((c) => !c.parentId);
}

/** Indexes replies by their parent id. */
export function buildReplyMap(comments: Comment[]): Map<string, Comment[]> {
  const map = new Map<string, Comment[]>();
  for (const reply of comments) {
    if (!reply.parentId) continue;
    const items = map.get(reply.parentId) ?? [];
    items.push(reply);
    map.set(reply.parentId, items);
  }
  return map;
}

/** Stable reply ordering: by creation time, then id. */
export function sortReplies(replies: Comment[]): Comment[] {
  return [...replies].sort((a, b) => {
    if (a.createdAt !== b.createdAt)
      return a.createdAt.localeCompare(b.createdAt);
    return String(a.id).localeCompare(String(b.id));
  });
}

/** Groups root comments by the value of a facet key (missing → ""). */
export function groupByFacet(
  comments: Comment[],
  facetKey: string,
): Map<string, Comment[]> {
  const map = new Map<string, Comment[]>();
  for (const root of getRoots(comments)) {
    const key = root.facets?.[facetKey] ?? "";
    const items = map.get(key) ?? [];
    items.push(root);
    map.set(key, items);
  }
  return map;
}

/** Per-anchor comment counts derived from the list (document-level → DOCUMENT_ANCHOR). */
export function deriveAnchorCounts(
  comments: Comment[],
): Record<CommentAnchor, number> {
  const counts: Record<CommentAnchor, number> = {};
  for (const c of comments) {
    const key = c.anchor ?? DOCUMENT_ANCHOR;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

/** Per-anchor aggregate metadata (count, distinct authors, latest status). */
export function deriveAnchorMeta(
  comments: Comment[],
): Record<CommentAnchor, CommentAnchorMeta> {
  const grouped: Record<CommentAnchor, Comment[]> = {};
  for (const c of comments) {
    const key = c.anchor ?? DOCUMENT_ANCHOR;
    (grouped[key] ??= []).push(c);
  }
  const meta: Record<CommentAnchor, CommentAnchorMeta> = {};
  for (const [anchor, items] of Object.entries(grouped)) {
    const authors = [
      ...new Set(
        items.map((c) => c.author?.name).filter((n): n is string => !!n),
      ),
    ];
    const latest = items.reduce((a, b) =>
      (a.updatedAt ?? a.createdAt) > (b.updatedAt ?? b.createdAt) ? a : b,
    );
    meta[anchor] = {
      count: items.length,
      authors,
      ...(latest.status != null ? { latestStatus: latest.status } : {}),
    };
  }
  return meta;
}

/** Sums counts for an anchor and its descendants under a separator-delimited prefix. */
export function commentCountForPrefix(
  counts: Record<string, number>,
  prefix: string,
  separator = ".",
): number {
  let total = 0;
  for (const [key, count] of Object.entries(counts)) {
    if (key === prefix || key.startsWith(prefix + separator)) total += count;
  }
  return total;
}

/** Advances a checklist status to the next in the cycle (wrapping). */
export function nextChecklistStatus(
  current: string,
  cycle = DEFAULT_CHECKLIST_CYCLE,
): string {
  const idx = cycle.indexOf(current);
  if (idx === -1) return cycle[0] ?? current;
  return cycle[(idx + 1) % cycle.length] ?? current;
}

/** Strips inline markdown punctuation and truncates to a plain preview. */
export function truncatePlain(body: string, max = 80): string {
  const plain = body.replace(/[#*_`~>[\]()!]/g, "").trim();
  return plain.length > max ? `${plain.slice(0, max)}…` : plain;
}

function authorKindOf(comment: Comment): CommentMentionKind {
  return comment.author?.kind ?? "user";
}

/**
 * Filters a comment list by status / facets / author kind while keeping threads
 * intact: a reply survives iff its root survives. An empty status set or empty
 * per-facet set means "no constraint" for that axis.
 */
export function applyCommentFilters(
  comments: Comment[],
  filters: CommentFilters,
  config: CommentConfig,
): Comment[] {
  const facetKeys = (config.facets ?? []).map((f) => f.key);
  const passingRootIds = new Set<string>();

  for (const root of getRoots(comments)) {
    if (
      filters.statuses.size > 0 &&
      (root.status == null || !filters.statuses.has(root.status))
    ) {
      continue;
    }
    if (
      filters.authorKind &&
      filters.authorKind !== "all" &&
      authorKindOf(root) !== filters.authorKind
    ) {
      continue;
    }
    const facetsPass = facetKeys.every((key) => {
      const selected = filters.facets[key];
      if (!selected || selected.size === 0) return true;
      const value = root.facets?.[key];
      return value != null && selected.has(value);
    });
    if (!facetsPass) continue;
    passingRootIds.add(root.id);
  }

  return comments.filter((c) =>
    c.parentId ? passingRootIds.has(c.parentId) : passingRootIds.has(c.id),
  );
}

/** True when any filter axis constrains the result. */
export function hasActiveFilters(filters: CommentFilters): boolean {
  if (filters.statuses.size > 0) return true;
  if (filters.authorKind && filters.authorKind !== "all") return true;
  return Object.values(filters.facets).some((set) => set.size > 0);
}

/** An empty filter state. */
export function emptyCommentFilters(): CommentFilters {
  return { statuses: new Set(), facets: {}, authorKind: "all" };
}

/** Finds mentionables whose `@name` token appears in a body (case-insensitive). */
export function matchMentionsInBody(
  body: string,
  mentionables: CommentMentionable[],
): CommentMention[] {
  const lower = body.toLowerCase();
  return mentionables
    .filter((m) => lower.includes(`@${m.name.toLowerCase()}`))
    .map((m) => ({ id: m.id, name: m.name, kind: m.kind }));
}

/** Per-id handlers consumed by CommentThreadList. */
export type ThreadListHandlers = {
  onUpdateStatus?: (id: string, status: string) => void;
  onChecklistToggle?: (id: string, index: number) => void;
  onDelete?: (id: string) => void;
  onReply?: (parent: Comment, body: string) => void | Promise<void>;
};

/**
 * Adapts high-level {@link CommentCallbacks} into the id-keyed handlers a
 * {@link CommentThreadList} consumes: resolves the next checklist status from the
 * cycle and extracts mentions from a reply body. Shared by `CommentThread` and
 * `CommentSidePanel` so the adaptation lives in one place.
 */
export function buildThreadListHandlers(
  comments: Comment[],
  config: CommentConfig,
  cb: CommentCallbacks,
): ThreadListHandlers {
  const handlers: ThreadListHandlers = {};
  if (cb.onUpdateStatus) handlers.onUpdateStatus = cb.onUpdateStatus;
  if (cb.onDelete) handlers.onDelete = cb.onDelete;
  if (cb.onChecklistToggle) {
    const toggle = cb.onChecklistToggle;
    handlers.onChecklistToggle = (id, index) => {
      const item = comments.find((c) => c.id === id)?.checklist?.[index];
      if (!item) return;
      void toggle(
        id,
        index,
        nextChecklistStatus(item.status, config.checklistStatusCycle),
      );
    };
  }
  if (cb.onReply) {
    const reply = cb.onReply;
    const onMention = cb.onMention;
    handlers.onReply = async (parent, body) => {
      const mentions = matchMentionsInBody(body, config.mentionables ?? []);
      await reply({
        parentId: parent.id,
        body,
        anchor: parent.anchor ?? null,
        ...(mentions.length > 0 ? { mentions } : {}),
      });
      for (const mention of mentions) onMention?.(mention, { body });
    };
  }
  return handlers;
}
