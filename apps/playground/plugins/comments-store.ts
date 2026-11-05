import type { Violation } from "../../../packages/ui/src/data/lint/types";
import { commentVocabularyItems } from "./vocabulary-registry";
import {
  vocabularyReferences,
  type CommentVocabularyItem,
} from "../../../packages/ui/src/comments/comment-vocabulary";
import { externalUrl } from "../src/bookmarklet/model";

import {
  COMMENT_ELEMENT_HTML_LIMIT,
  COMMENT_ELEMENT_HTML_TRUNCATION,
  COMMENT_LOCATOR_SELECTOR_LIMIT,
  COMMENT_LOCATOR_TEXT_LIMIT,
  type CommentElementContext,
  type CommentLocator,
} from "./comments-model";
import { assertStoredScreenshot } from "./comments-screenshots";
import { commentsClient } from "./comments-client";
export {
  readAll,
  readPage,
  writeAll,
  lookupComment as findComment,
  addReply,
  patchComment,
  removeComment,
} from "./comments-client";
import {
  COMMENT_STATUSES,
  RESOLVED_STATUS,
  UNRESOLVED_STATUSES,
} from "./comments-statuses";

export const COMMENT_RATINGS = ["positive", "negative"] as const;
export type CommentRating = (typeof COMMENT_RATINGS)[number];
export const REVIEW_DECISIONS = [
  "approved",
  "rejected",
  "revision_requested",
] as const;
export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];

/**
 * Playground API projection of feedback. Deliberately structural rather than an
 * import of the library's `Comment` type: this module is loaded by Vite's config
 * bundler, where the `@flanksource/clicky-ui` source aliases do not apply.
 */
export type StoredAuthor = {
  id?: string;
  name: string;
  model?: string;
  effort?: string;
  kind?: "user" | "agent";
  /** The agent that posted on `name`'s behalf, when another agent wrote the text. */
  via?: string;
  /** The session that produced the text, so the run can be inspected later. */
  sessionId?: string;
  /** AI response cost in USD for producing the text. */
  cost?: number;
};

export const AGENT_RUN_STATES = ["queued", "sent", "done", "error"] as const;
export type AgentRunState = (typeof AGENT_RUN_STATES)[number];

/**
 * Hand-off of a root to the playground's shared agent session. Several roots
 * share one `sessionId`; the agent itself replies and resolves each one, which
 * moves its state to `done`.
 */
export type StoredAgentRun = {
  /** Absent when the hand-off failed before a session existed. */
  sessionId?: string;
  requestedAt: string;
  state: AgentRunState;
  /** Why the hand-off failed; present only when `state` is `error`. */
  error?: string;
  /** The live captain session it went to, when not the playground's own; `channel` once delivered. */
  target?: { label: string; channel?: string };
};

/** One finding of a structured comment, rendered as a chip and toggled by status. */
export type StoredChecklistItem = { label: string; status: string };

/** A labelled group of references (files, selectors) rendered as chips. */
export type StoredRefGroup = { label: string; items: string[]; mono?: boolean };

/** The captain prompt run a root was produced by. */
export type StoredPromptRun = {
  promptId: string;
  promptName: string;
  runId: string;
  sessionId?: string;
  variables?: Record<string, unknown>;
};

export type StoredComment = {
  id: string;
  version?: number;
  rootId?: string;
  body: string;
  createdAt: string;
  updatedAt?: string;
  author: StoredAuthor | null;
  status?: string;
  parentId?: string | null;
  anchor?: string | null;
  rating?: CommentRating;
  reviewDecision?: ReviewDecision;
  closedAt?: string;
  closedBy?: StoredAuthor;
  /** Who holds the thread while it is in progress; kept on record once resolved. */
  assignee?: StoredAuthor;
  /** When `acknowledgedBy` picked the thread up. Absent while merely assigned. */
  acknowledgedAt?: string;
  acknowledgedBy?: StoredAuthor;
  agentRun?: StoredAgentRun;
  element?: CommentElementContext;
  checklist?: StoredChecklistItem[];
  vocabularyRefs?: CommentVocabularyItem[];
  refs?: StoredRefGroup[];
  promptRun?: StoredPromptRun;
  /** The lint findings a prompt run reported, kept verbatim. */
  lint?: { violations: Violation[] };
};

/** Page slug → the comments left on that page. */
export type CommentsFile = Record<string, StoredComment[]>;

/** A comment plus the page it lives on, for listings that span pages. */
export type ListedComment = StoredComment & { page: string };

export type CommentPatch = {
  body?: string;
  status?: string;
  rating?: CommentRating;
  updatedAt?: string;
  closedAt?: string | null;
  closedBy?: StoredAuthor | null;
  assignee?: StoredAuthor | null;
  acknowledgedAt?: string | null;
  acknowledgedBy?: StoredAuthor | null;
  agentRun?: StoredAgentRun | null;
};

export { COMMENT_STATUSES, RESOLVED_STATUS, UNRESOLVED_STATUSES };

export function assertPage(page: unknown): string {
  if (typeof page !== "string" || page === "") {
    throw new Error("a comment requires a non-empty page slug");
  }
  return page;
}

/** Keeps an agent from writing a status the comment rail cannot render. */
export function assertStatus(status: unknown): string {
  if (
    typeof status !== "string" ||
    !COMMENT_STATUSES.includes(status as never)
  ) {
    throw new Error(
      `status ${JSON.stringify(status)} is not one of ${COMMENT_STATUSES.join(", ")}`,
    );
  }
  return status;
}

export function assertRating(rating: unknown): CommentRating {
  if (
    typeof rating !== "string" ||
    !COMMENT_RATINGS.includes(rating as CommentRating)
  ) {
    throw new Error(
      `rating ${JSON.stringify(rating)} is not one of ${COMMENT_RATINGS.join(", ")}`,
    );
  }
  return rating as CommentRating;
}

export function assertReviewDecision(value: unknown): ReviewDecision {
  if (
    typeof value !== "string" ||
    !REVIEW_DECISIONS.includes(value as ReviewDecision)
  ) {
    throw new Error(
      `review decision ${JSON.stringify(value)} is not one of ${REVIEW_DECISIONS.join(", ")}`,
    );
  }
  return value as ReviewDecision;
}

export function assertElementContext(input: unknown): CommentElementContext {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("comment element context must be an object");
  }
  const candidate = input as Record<string, unknown>;
  const allowedFields = new Set([
    "componentName",
    "pageUrl",
    "source",
    "html",
    "locators",
    "screenshot",
  ]);
  const unexpected = Object.keys(candidate).find(
    (key) => !allowedFields.has(key),
  );
  if (unexpected) {
    throw new Error(
      `comment element context has unexpected field ${JSON.stringify(unexpected)}`,
    );
  }
  const source = candidate["source"];
  if (candidate["pageUrl"] !== undefined) {
    if (typeof candidate["pageUrl"] !== "string") {
      throw new Error("comment element pageUrl must be a URL string");
    }
    externalUrl(candidate["pageUrl"]);
  }
  const html = candidate["html"];
  if (typeof source !== "string" || source === "") {
    throw new Error("comment element source must be a non-empty string");
  }
  if (typeof html !== "string" || html === "") {
    throw new Error("comment element html must be a non-empty string");
  }
  const truncatedLength =
    COMMENT_ELEMENT_HTML_LIMIT + COMMENT_ELEMENT_HTML_TRUNCATION.length;
  if (
    html.length > COMMENT_ELEMENT_HTML_LIMIT &&
    (html.length !== truncatedLength ||
      !html.endsWith(COMMENT_ELEMENT_HTML_TRUNCATION))
  ) {
    throw new Error(
      `comment element html exceeds the ${COMMENT_ELEMENT_HTML_LIMIT}-character capture limit`,
    );
  }
  const componentName = candidate["componentName"];
  if (
    componentName !== undefined &&
    (typeof componentName !== "string" || componentName === "")
  ) {
    throw new Error("comment element componentName must be a non-empty string");
  }
  if (candidate["screenshot"] !== undefined) {
    assertStoredScreenshot(candidate["screenshot"]);
  }
  if (candidate["locators"] !== undefined) {
    assertLocators(candidate["locators"]);
  }
  return input as CommentElementContext;
}

const LOCATOR_FIELDS: Record<CommentLocator["kind"], readonly string[]> = {
  css: ["selector"],
  role: ["tag", "role", "name"],
  text: ["tag", "text"],
  markdown: ["tag", "text"],
};
const OPTIONAL_LOCATOR_FIELDS: Record<
  CommentLocator["kind"],
  readonly string[]
> = {
  css: [],
  role: [],
  text: ["heading", "scope"],
  markdown: ["path", "line"],
};

const SELECTOR_FIELDS = new Set(["selector", "scope"]);

function assertLocatorText(value: unknown, field: string): void {
  const limit = SELECTOR_FIELDS.has(field.split(".").pop() ?? "")
    ? COMMENT_LOCATOR_SELECTOR_LIMIT
    : COMMENT_LOCATOR_TEXT_LIMIT;
  if (typeof value !== "string" || value === "" || value.length > limit) {
    throw new Error(
      `comment element locator ${field} must be a non-empty string of at most ${limit} characters`,
    );
  }
}

function assertLocators(input: unknown): void {
  if (!Array.isArray(input) || input.length === 0) {
    throw new Error("comment element locators must be a non-empty array");
  }
  for (const locator of input) {
    if (
      locator === null ||
      typeof locator !== "object" ||
      Array.isArray(locator)
    ) {
      throw new Error("comment element locator must be an object");
    }
    const entry = locator as Record<string, unknown>;
    const kind = entry["kind"];
    if (typeof kind !== "string" || !Object.hasOwn(LOCATOR_FIELDS, kind)) {
      throw new Error(
        `comment element locator has unknown kind ${JSON.stringify(kind)}`,
      );
    }
    const required = LOCATOR_FIELDS[kind as CommentLocator["kind"]];
    const optional = OPTIONAL_LOCATOR_FIELDS[kind as CommentLocator["kind"]];
    const unexpected = Object.keys(entry).find(
      (key) =>
        key !== "kind" && !required.includes(key) && !optional.includes(key),
    );
    if (unexpected) {
      throw new Error(
        `comment element ${kind} locator has unexpected field ${JSON.stringify(unexpected)}`,
      );
    }
    for (const field of required)
      assertLocatorText(entry[field], `${kind}.${field}`);
    if (kind === "markdown") {
      const { path, line } = entry;
      if (!Array.isArray(path)) {
        throw new Error(
          "comment element markdown locator path must be an array of heading texts",
        );
      }
      path.forEach((heading, index) =>
        assertLocatorText(heading, `markdown.path[${index}]`),
      );
      if (
        line !== undefined &&
        !(Number.isInteger(line) && (line as number) > 0)
      ) {
        throw new Error(
          "comment element markdown locator line must be a positive integer",
        );
      }
    }
    if (entry["scope"] !== undefined)
      assertLocatorText(entry["scope"], "text.scope");
    if (entry["heading"] !== undefined) {
      const heading = entry["heading"];
      if (
        heading === null ||
        typeof heading !== "object" ||
        Array.isArray(heading)
      ) {
        throw new Error("comment element locator heading must be an object");
      }
      const fields = heading as Record<string, unknown>;
      if (
        Object.keys(fields).some((key) => key !== "selector" && key !== "text")
      ) {
        throw new Error(
          "comment element locator heading has unexpected fields",
        );
      }
      assertLocatorText(fields["selector"], "heading.selector");
      assertLocatorText(fields["text"], "heading.text");
    }
  }
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

/** Checklist, refs, prompt provenance and lint findings: only prompt runs write them. */
function assertStructuredFields(candidate: Record<string, unknown>): void {
  const { checklist, refs, promptRun, lint } = candidate;
  if (
    checklist !== undefined &&
    !(
      Array.isArray(checklist) &&
      checklist.every(
        (item: Partial<StoredChecklistItem> | null) =>
          typeof item?.label === "string" && typeof item.status === "string",
      )
    )
  ) {
    throw new Error("checklist must be [{label, status}]");
  }
  if (
    refs !== undefined &&
    !(
      Array.isArray(refs) &&
      refs.every(
        (group: Partial<StoredRefGroup> | null) =>
          typeof group?.label === "string" &&
          isStringArray(group.items) &&
          (group.mono === undefined || typeof group.mono === "boolean"),
      )
    )
  ) {
    throw new Error("refs must be [{label, items: string[], mono?}]");
  }
  if (promptRun !== undefined) {
    const run = promptRun as Partial<StoredPromptRun> | null;
    if (
      typeof run?.promptId !== "string" ||
      typeof run.promptName !== "string" ||
      typeof run.runId !== "string" ||
      (run.sessionId !== undefined && typeof run.sessionId !== "string") ||
      (run.variables !== undefined &&
        (run.variables === null || typeof run.variables !== "object"))
    ) {
      throw new Error(
        "promptRun must be {promptId, promptName, runId, sessionId?, variables}",
      );
    }
  }
  if (
    lint !== undefined &&
    !Array.isArray((lint as { violations?: unknown } | null)?.violations)
  ) {
    throw new Error("lint must be {violations: []}");
  }
}

export function assertComment(input: unknown): StoredComment {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("comment payload must be an object");
  }
  const candidate = input as Record<string, unknown>;
  for (const key of ["id", "createdAt"] as const) {
    const value = candidate[key];
    if (typeof value !== "string" || value === "") {
      throw new Error(`comment payload requires a non-empty string "${key}"`);
    }
  }
  if (typeof candidate["body"] !== "string") {
    throw new Error('comment payload requires a string "body"');
  }
  if (candidate["rating"] !== undefined) assertRating(candidate["rating"]);
  if (candidate["reviewDecision"] !== undefined)
    assertReviewDecision(candidate["reviewDecision"]);
  if (
    candidate["body"] === "" &&
    candidate["rating"] === undefined &&
    candidate["reviewDecision"] !== "approved"
  ) {
    throw new Error("comment payload requires body or rating");
  }
  if (
    !("author" in candidate) ||
    (candidate["author"] !== null && typeof candidate["author"] !== "object")
  ) {
    throw new Error('comment payload requires an "author" object or null');
  }
  if (candidate["status"] !== undefined) assertStatus(candidate["status"]);
  if (candidate["agentRun"] !== undefined) {
    const run = candidate["agentRun"] as Partial<StoredAgentRun> | null;
    if (
      run === null ||
      typeof run !== "object" ||
      (run.sessionId !== undefined && typeof run.sessionId !== "string") ||
      typeof run.requestedAt !== "string" ||
      !AGENT_RUN_STATES.includes(run.state as AgentRunState) ||
      (run.target !== undefined &&
        (typeof run.target !== "object" ||
          run.target === null ||
          typeof run.target.label !== "string" ||
          (run.target.channel !== undefined &&
            typeof run.target.channel !== "string")))
    ) {
      throw new Error(
        `agentRun must be {sessionId?, requestedAt, state: ${AGENT_RUN_STATES.join("|")}, target?: {label, channel?}}`,
      );
    }
  }
  if (candidate["element"] !== undefined) {
    assertElementContext(candidate["element"]);
  }
  assertStructuredFields(candidate);
  const isReply = typeof candidate["parentId"] === "string";
  if (isReply && candidate["reviewDecision"] !== undefined) {
    throw new Error("review decisions belong on thread roots");
  }
  const anchor = candidate["anchor"];
  const isAnchoredRoot =
    !isReply && typeof anchor === "string" && anchor !== "__document__";
  if (isAnchoredRoot && candidate["element"] === undefined) {
    throw new Error("an anchored root requires element context");
  }
  if (isReply && candidate["element"] !== undefined) {
    throw new Error("replies inherit their root element context");
  }
  return input as StoredComment;
}

export async function addComment(
  dir: string,
  page: string,
  comment: StoredComment,
): Promise<StoredComment> {
  assertPage(page);
  const { vocabularyRefs: _untrusted, ...fields } = comment;
  const vocabularyRefs = vocabularyReferences(
    comment.body,
    commentVocabularyItems(dir),
  );
  const validated = vocabularyRefs.length
    ? { ...fields, vocabularyRefs }
    : fields;
  assertComment(validated);
  return commentsClient(dir).add(page, validated);
}
