import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type { Violation } from "../../../packages/ui/src/data/lint/types";
import { VOCABULARY_ITEMS } from "../src/vocabularies/catalog";
import { vocabularyReferences, type CommentVocabularyItem } from "../../../packages/ui/src/comments/comment-vocabulary";
import { externalUrl } from "../src/bookmarklet/model";

import {
  COMMENT_ELEMENT_HTML_LIMIT,
  COMMENT_ELEMENT_HTML_TRUNCATION,
  COMMENT_LOCATOR_SELECTOR_LIMIT,
  COMMENT_LOCATOR_TEXT_LIMIT,
  type CommentElementContext,
  type CommentLocator,
} from "./comments-model";
import {
  assertStoredScreenshot,
  stageScreenshotRemoval,
} from "./comments-screenshots";
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
 * On-disk shape for playground feedback. Deliberately structural rather than an
 * import of the library's `Comment` type: this module is loaded by Vite's config
 * bundler, where the `@flanksource/clicky-ui` source aliases do not apply.
 */
export type StoredAuthor = {
  id?: string;
  name: string;
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

export const COMMENTS_FILENAME = "comments.json";

export function commentsPath(dir: string): string {
  return join(dir, COMMENTS_FILENAME);
}

export function readAll(dir: string): CommentsFile {
  const file = commentsPath(dir);
  if (!existsSync(file)) return {};

  const raw = readFileSync(file, "utf8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `${file} is not valid JSON — fix or delete it (${(error as Error).message})`,
    );
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${file} must contain a JSON object keyed by page slug`);
  }
  for (const [page, list] of Object.entries(parsed)) {
    if (!Array.isArray(list)) {
      throw new Error(
        `${file}: page "${page}" must map to an array of comments`,
      );
    }
  }
  return parsed as CommentsFile;
}

export function readPage(dir: string, page: string): StoredComment[] {
  return readAll(dir)[page] ?? [];
}

export function writeAll(dir: string, data: CommentsFile): void {
  mkdirSync(dir, { recursive: true });
  const file = commentsPath(dir);
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  renameSync(tmp, file);
}

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
const OPTIONAL_LOCATOR_FIELDS: Record<CommentLocator["kind"], readonly string[]> = {
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
    if (locator === null || typeof locator !== "object" || Array.isArray(locator)) {
      throw new Error("comment element locator must be an object");
    }
    const entry = locator as Record<string, unknown>;
    const kind = entry["kind"];
    if (typeof kind !== "string" || !Object.hasOwn(LOCATOR_FIELDS, kind)) {
      throw new Error(`comment element locator has unknown kind ${JSON.stringify(kind)}`);
    }
    const required = LOCATOR_FIELDS[kind as CommentLocator["kind"]];
    const optional = OPTIONAL_LOCATOR_FIELDS[kind as CommentLocator["kind"]];
    const unexpected = Object.keys(entry).find(
      (key) => key !== "kind" && !required.includes(key) && !optional.includes(key),
    );
    if (unexpected) {
      throw new Error(`comment element ${kind} locator has unexpected field ${JSON.stringify(unexpected)}`);
    }
    for (const field of required) assertLocatorText(entry[field], `${kind}.${field}`);
    if (kind === "markdown") {
      const { path, line } = entry;
      if (!Array.isArray(path)) {
        throw new Error("comment element markdown locator path must be an array of heading texts");
      }
      path.forEach((heading, index) => assertLocatorText(heading, `markdown.path[${index}]`));
      if (line !== undefined && !(Number.isInteger(line) && (line as number) > 0)) {
        throw new Error("comment element markdown locator line must be a positive integer");
      }
    }
    if (entry["scope"] !== undefined) assertLocatorText(entry["scope"], "text.scope");
    if (entry["heading"] !== undefined) {
      const heading = entry["heading"];
      if (heading === null || typeof heading !== "object" || Array.isArray(heading)) {
        throw new Error("comment element locator heading must be an object");
      }
      const fields = heading as Record<string, unknown>;
      if (Object.keys(fields).some((key) => key !== "selector" && key !== "text")) {
        throw new Error("comment element locator heading has unexpected fields");
      }
      assertLocatorText(fields["selector"], "heading.selector");
      assertLocatorText(fields["text"], "heading.text");
    }
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
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
      (run.variables !== undefined && (run.variables === null || typeof run.variables !== "object"))
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
          (run.target.channel !== undefined && typeof run.target.channel !== "string")))
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

/**
 * Reads a listing request off the query string. Pure and exported so the query
 * vocabulary an agent has to get right is unit-tested, leaving the middleware a
 * thin HTTP shell.
 */
/** Ids are UUIDs, so a comment is addressable without knowing its page. */
export function findComment(
  dir: string,
  id: string,
): { page: string; comment: StoredComment } | undefined {
  for (const [page, list] of Object.entries(readAll(dir))) {
    const comment = list.find((entry) => entry.id === id);
    if (comment) return { page, comment };
  }
  return undefined;
}

function requireComment(
  dir: string,
  id: string,
): { page: string; comment: StoredComment } {
  const found = findComment(dir, id);
  if (!found) throw new Error(`comment "${id}" not found`);
  return found;
}

/** Walks up to the thread root so replies never nest more than one level. */
function rootOf(
  dir: string,
  id: string,
): { page: string; comment: StoredComment } {
  const found = requireComment(dir, id);
  const list = readPage(dir, found.page);

  let current = found.comment;
  const seen = new Set([current.id]);
  while (current.parentId) {
    const parent = list.find((entry) => entry.id === current.parentId);
    if (!parent || seen.has(parent.id)) break;
    seen.add(parent.id);
    current = parent;
  }
  return { page: found.page, comment: current };
}

export function addComment(
  dir: string,
  page: string,
  comment: StoredComment,
): StoredComment {
  assertPage(page);
  const { vocabularyRefs: _untrustedRefs, ...fields } = comment;
  const vocabularyRefs = vocabularyReferences(comment.body, VOCABULARY_ITEMS);
  comment = vocabularyRefs.length ? { ...fields, vocabularyRefs } : fields;
  assertComment(comment);

  const data = readAll(dir);
  const list = data[page] ?? [];
  if (list.some((entry) => entry.id === comment.id)) {
    throw new Error(
      `comment id "${comment.id}" already exists on page "${page}"`,
    );
  }
  data[page] = [...list, comment];
  writeAll(dir, data);
  return comment;
}

/**
 * Attaches a reply to `parentId`'s thread root, inheriting the root's page and
 * anchor — a caller only has to know the id it is answering.
 */
export function addReply(
  dir: string,
  parentId: string,
  reply: StoredComment,
): StoredComment {
  const root = rootOf(dir, parentId);
  const { element: _rootOnly, ...replyFields } = reply;
  return addComment(dir, root.page, {
    ...replyFields,
    parentId: root.comment.id,
    anchor: root.comment.anchor ?? null,
  });
}

export function patchComment(
  dir: string,
  id: string,
  patch: CommentPatch,
): StoredComment {
  if (patch.status !== undefined) assertStatus(patch.status);
  if (patch.rating !== undefined) assertRating(patch.rating);

  const { page } = requireComment(dir, id);
  const data = readAll(dir);
  const list = data[page] ?? [];

  const next = list.map((entry) => {
    if (entry.id !== id) return entry;
    const updated: StoredComment = {
      ...entry,
      ...(patch.body !== undefined ? { body: patch.body, vocabularyRefs: vocabularyReferences(patch.body, VOCABULARY_ITEMS) } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.rating !== undefined ? { rating: patch.rating } : {}),
      ...(patch.updatedAt !== undefined ? { updatedAt: patch.updatedAt } : {}),
      ...(typeof patch.closedAt === "string"
        ? { closedAt: patch.closedAt }
        : {}),
      ...(patch.closedBy ? { closedBy: patch.closedBy } : {}),
      ...(patch.assignee ? { assignee: patch.assignee } : {}),
      ...(typeof patch.acknowledgedAt === "string"
        ? { acknowledgedAt: patch.acknowledgedAt }
        : {}),
      ...(patch.acknowledgedBy
        ? { acknowledgedBy: patch.acknowledgedBy }
        : {}),
      ...(patch.agentRun ? { agentRun: patch.agentRun } : {}),
    };
    if (patch.agentRun === null) delete updated.agentRun;
    if (updated.vocabularyRefs?.length === 0) delete updated.vocabularyRefs;
    if (patch.closedAt === null) delete updated.closedAt;
    if (patch.closedBy === null) delete updated.closedBy;
    if (patch.assignee === null) delete updated.assignee;
    if (patch.acknowledgedAt === null) delete updated.acknowledgedAt;
    if (patch.acknowledgedBy === null) delete updated.acknowledgedBy;
    return updated;
  });
  data[page] = next;
  writeAll(dir, data);
  return next.find((entry) => entry.id === id) as StoredComment;
}

/** Removes a comment and, when it is a thread root, every reply beneath it. */
export function removeComment(dir: string, id: string): number {
  const { page } = requireComment(dir, id);
  const data = readAll(dir);
  const list = data[page] ?? [];

  const doomed = new Set([id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const entry of list) {
      if (
        entry.parentId &&
        doomed.has(entry.parentId) &&
        !doomed.has(entry.id)
      ) {
        doomed.add(entry.id);
        grew = true;
      }
    }
  }

  const removed = list.filter((entry) => doomed.has(entry.id));
  const screenshotRemoval = stageScreenshotRemoval(dir, removed);
  data[page] = list.filter((entry) => !doomed.has(entry.id));
  try {
    writeAll(dir, data);
    screenshotRemoval.commit();
  } catch (cause) {
    try {
      screenshotRemoval.rollback();
      data[page] = list;
      writeAll(dir, data);
    } catch (rollbackCause) {
      throw new Error(
        `comment deletion failed (${String(cause)}) and rollback failed (${String(rollbackCause)})`,
      );
    }
    throw new Error(
      `comment deletion failed and was rolled back: ${String(cause)}`,
    );
  }
  return doomed.size;
}
