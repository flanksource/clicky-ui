import type { ReactNode } from "react";
import type { StaticIconComponent } from "../data/Icon";

/** Semantic tone driving a status/facet color (maps onto Badge tones). */
export type CommentTone =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

/** A single selectable status (e.g. "open", "resolved"). Consumer-defined. */
export type CommentStatusConfig = {
  /** Stable value stored on a comment's `status`. */
  value: string;
  /** Human label shown in menus and badges. */
  label: string;
  /** Color tone for the status chip. */
  tone?: CommentTone;
  /** Optional leading glyph. */
  icon?: string | StaticIconComponent;
  /**
   * Whether this status counts as "unresolved/open" — drives progress tallies
   * and which groups start expanded. Defaults to false.
   */
  unresolved?: boolean;
};

/** One option of a generic facet (e.g. a "category" value). */
export type CommentFacetOption = {
  value: string;
  label: string;
  tone?: CommentTone;
  /** Compact glyph for the collapsed card (e.g. "BS" for a category). */
  short?: string;
};

/**
 * A generic, consumer-supplied classification axis. Replaces the financial
 * category/severity vocabulary — any app declares its own facets.
 */
export type CommentFacet = {
  /** Key into `Comment.facets`. */
  key: string;
  label: string;
  options: CommentFacetOption[];
  /** Allow several values to be selected at once in the filter bar. */
  multiple?: boolean;
};

export type CommentMentionKind = "user" | "agent";

/** A person or agent that can be @-mentioned in the composer. */
export type CommentMentionable = {
  id: string;
  name: string;
  /** Image URL for `kind: "user"`. */
  avatar?: string;
  kind: CommentMentionKind;
  /** Glyph override for `kind: "agent"`. */
  icon?: string | StaticIconComponent;
};

/** A resolved mention emitted when a comment referencing a mentionable is posted. */
export type CommentMention = {
  id: string;
  name: string;
  kind: CommentMentionKind;
};

/** A labelled group of reference chips (e.g. linked ids). */
export type CommentRefGroup = {
  label: string;
  items: string[];
  /** Render items in a monospace font. */
  mono?: boolean;
};

/** One item of a generic checklist; `status` cycles through `checklistStatusCycle`. */
export type CommentChecklistItem = {
  label: string;
  status: string;
};

export type CommentAuthor = {
  id?: string;
  name: string;
  kind?: CommentMentionKind;
  avatar?: string;
  /** Glyph override for `kind: "agent"` authors. */
  icon?: string | StaticIconComponent;
};

/**
 * An opaque anchor key locating a comment within a document. Not a JSON path —
 * any stable string a consumer registers via the provider. `null`/absent means
 * document-level.
 */
export type CommentAnchor = string;

/** Anchor key reserved for document-level (un-anchored) comments. */
export const DOCUMENT_ANCHOR = "__document__";

/** A single comment. Replies set `parentId`; roots leave it null. */
export type Comment = {
  id: string;
  body: string;
  /** ISO-8601 creation time. */
  createdAt: string;
  /** ISO-8601 last-update time. */
  updatedAt?: string;
  author: CommentAuthor | null;
  /** Key into the configured statuses; roots only. */
  status?: string;
  /** Parent comment id when this is a reply. */
  parentId?: string | null;
  /** Where the comment is anchored; null/absent = document-level. */
  anchor?: CommentAnchor | null;
  /** facet.key → selected option value. */
  facets?: Record<string, string>;
  refs?: CommentRefGroup[];
  checklist?: CommentChecklistItem[];
};

/** Payload for creating a new root comment. */
export type CommentCreateInput = {
  body: string;
  anchor?: CommentAnchor | null;
  facets?: Record<string, string>;
  mentions?: CommentMention[];
};

/** Payload for replying to a comment. */
export type CommentReplyInput = {
  parentId: string;
  body: string;
  anchor?: CommentAnchor | null;
  mentions?: CommentMention[];
};

/**
 * Controlled callbacks. The components own no data fetching; the consumer
 * performs the mutation and feeds the updated `comments` back in.
 */
export type CommentCallbacks = {
  onCreate?: (input: CommentCreateInput) => void | Promise<void>;
  onReply?: (input: CommentReplyInput) => void | Promise<void>;
  onUpdateStatus?: (id: string, status: string) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  onChecklistToggle?: (
    id: string,
    index: number,
    next: string,
  ) => void | Promise<void>;
  /** Fired when a posted comment references a mentionable. */
  onMention?: (mention: CommentMention, context: { body: string }) => void;
};

/** Static configuration shared across the comment components. */
export type CommentConfig = {
  /** Selectable statuses; the first `unresolved` one is the default for new comments. */
  statuses: CommentStatusConfig[];
  /** Classification axes (category/severity/etc.). */
  facets?: CommentFacet[];
  /** People/agents available for @-mention. */
  mentionables?: CommentMentionable[];
  /** Status values a checklist item cycles through on click. */
  checklistStatusCycle?: string[];
};

/** Aggregate metadata for one anchor, derived from the comment list. */
export type CommentAnchorMeta = {
  count: number;
  authors: string[];
  latestStatus?: string;
};

/** Selected filter state for the filter bar / `applyCommentFilters`. */
export type CommentFilters = {
  /** Selected status values; empty = all statuses. */
  statuses: Set<string>;
  /** facet.key → selected option values; empty set = all values for that facet. */
  facets: Record<string, Set<string>>;
  /** Restrict to an author kind, or "all". */
  authorKind?: CommentMentionKind | "all";
};

/** Optional renderers passed down to a card. */
export type CommentRenderOptions = {
  /** Custom comment-body renderer (e.g. full Markdown). Defaults to CommentMarkdown. */
  renderBody?: (body: string) => ReactNode;
};

/** A domain-free default status set: open / in progress / resolved. */
export const DEFAULT_COMMENT_STATUSES: CommentStatusConfig[] = [
  { value: "open", label: "Open", tone: "info", unresolved: true },
  {
    value: "in_progress",
    label: "In progress",
    tone: "warning",
    unresolved: true,
  },
  { value: "resolved", label: "Resolved", tone: "success" },
  { value: "closed", label: "Closed", tone: "neutral" },
];

/** Default checklist status cycle used when a consumer omits one. */
export const DEFAULT_CHECKLIST_CYCLE = ["open", "in_progress", "done"];
