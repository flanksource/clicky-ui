import {
  COMMENT_RATINGS,
  COMMENT_STATUSES,
  RESOLVED_STATUS,
  UNRESOLVED_STATUSES,
} from "./comments-store";

/**
 * Machine-readable descriptions of the comment endpoints, served from
 * `GET /__playground/comments/schema` so a model can discover the API instead
 * of being told about it in a prompt.
 *
 * The shape mirrors the library's `ToolMeta` (`data/chat/types.ts`) and the
 * MCP-style annotations `clickyOperationsToTools.ts` emits, but is re-declared
 * structurally for the same reason `StoredComment` is: this module is loaded by
 * Vite's config bundler, where the package aliases do not apply.
 */
export type JsonProperty = {
  type: "string" | "boolean" | "object";
  description: string;
  enum?: string[];
  default?: string | boolean;
  properties?: Record<string, JsonProperty>;
  required?: string[];
};

export type CommentToolInputSchema = {
  type: "object";
  properties: Record<string, JsonProperty>;
  required?: string[];
  additionalProperties: false;
};

export type CommentToolAnnotations = {
  readOnlyHint?: boolean;
  idempotentHint?: boolean;
  destructiveHint?: boolean;
};

export type CommentTool = {
  name: string;
  label: string;
  description: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  /** Absolute request path; `{id}` is a comment id. */
  path: string;
  annotations: CommentToolAnnotations;
  inputSchema: CommentToolInputSchema;
};

const BASE = "/__playground/comments";

const STATUS_VALUES = [...COMMENT_STATUSES];

const AUTHOR: JsonProperty = {
  type: "object",
  description:
    'Who is writing. Agents should identify themselves, e.g. {"name":"Claude","kind":"agent"}.',
  properties: {
    name: { type: "string", description: "Display name shown on the comment." },
    kind: {
      type: "string",
      description: "Renders an agent glyph instead of a user avatar.",
      enum: ["user", "agent"],
    },
  },
  required: ["name"],
};

const BODY: JsonProperty = {
  type: "string",
  description:
    "Comment text. Markdown is rendered. May be empty only when a rating is supplied.",
};

const ID: JsonProperty = {
  type: "string",
  description: "Comment id, as returned by list_comments.",
};

const STATUS: JsonProperty = {
  type: "string",
  description: `Comment status. ${UNRESOLVED_STATUSES.join(" and ")} count as unresolved.`,
  enum: STATUS_VALUES,
};

const RATING: JsonProperty = {
  type: "string",
  description: "Optional positive or negative review signal.",
  enum: [...COMMENT_RATINGS],
};

export const COMMENT_TOOLS: CommentTool[] = [
  {
    name: "list_comments",
    label: "List comments",
    description:
      "List playground feedback across every artifact page. Each comment carries the page it was left on and, when anchored, a CSS path to the element it points at. Replies carry parentId and no status.",
    method: "GET",
    path: BASE,
    annotations: { readOnlyHint: true, idempotentHint: true },
    inputSchema: {
      type: "object",
      properties: {
        page: {
          type: "string",
          description:
            'Restrict to one page slug, e.g. "welcome" or "flanksource/foundations/tones".',
        },
        status: {
          type: "string",
          description:
            "Restrict to these statuses (repeat or comma-separate). Matches thread roots; replies come along.",
          enum: STATUS_VALUES,
        },
        unresolved: {
          type: "boolean",
          description: `Shorthand for status=${UNRESOLVED_STATUSES.join(",")} — everything still needing work.`,
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "create_comment",
    label: "Create comment",
    description:
      "Start a new comment thread or rating on a page. Supply body, rating, or both. Omit anchor for a page-level note; supply the CSS path from an existing comment to pin it to the same element. The server assigns id and createdAt.",
    method: "POST",
    path: BASE,
    annotations: {},
    inputSchema: {
      type: "object",
      properties: {
        page: {
          type: "string",
          description: "Page slug the comment belongs to.",
        },
        body: BODY,
        rating: RATING,
        author: AUTHOR,
        anchor: {
          type: "string",
          description:
            "CSS path to the element this note is about. Omit for a page-level note.",
        },
        status: {
          ...STATUS,
          description: `${STATUS.description} Defaults to "open".`,
        },
      },
      required: ["page", "author"],
      additionalProperties: false,
    },
  },
  {
    name: "reply_to_comment",
    label: "Reply to comment",
    description:
      "Reply in an existing thread. The page and anchor are inherited from the thread root, so answering a comment needs nothing but its id.",
    method: "POST",
    path: `${BASE}/{id}/replies`,
    annotations: {},
    inputSchema: {
      type: "object",
      properties: { id: ID, body: BODY, author: AUTHOR },
      required: ["id", "body", "author"],
      additionalProperties: false,
    },
  },
  {
    name: "resolve_comment",
    label: "Resolve comment",
    description:
      "Mark a thread as dealt with. Use this once the feedback has been acted on so it drops out of the unresolved listing.",
    method: "POST",
    path: `${BASE}/{id}/resolve`,
    annotations: { idempotentHint: true },
    inputSchema: {
      type: "object",
      properties: {
        id: ID,
        status: {
          ...STATUS,
          description: `${STATUS.description} Defaults to "${RESOLVED_STATUS}".`,
        },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "update_comment",
    label: "Update comment",
    description:
      "Edit a comment's text or move it to any status, including back to open. Sets updatedAt.",
    method: "PATCH",
    path: `${BASE}/{id}`,
    annotations: { idempotentHint: true },
    inputSchema: {
      type: "object",
      properties: { id: ID, body: BODY, status: STATUS, rating: RATING },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "delete_comment",
    label: "Delete comment",
    description:
      "Permanently remove a comment. Deleting a thread root also deletes every reply beneath it. Prefer resolve_comment for feedback that has been addressed.",
    method: "DELETE",
    path: `${BASE}/{id}`,
    annotations: { idempotentHint: true, destructiveHint: true },
    inputSchema: {
      type: "object",
      properties: { id: ID },
      required: ["id"],
      additionalProperties: false,
    },
  },
];
