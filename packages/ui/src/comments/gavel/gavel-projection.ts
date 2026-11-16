import { patchAnchor } from "../anchoring/patch-anchor";
import { regionAnchor } from "../anchoring/region-anchor";
import type { PatchAnchor, RegionAnchor, TextQuote } from "../annotation-types";
import type { StoredAgentRun, StoredAuthor, StoredComment, StoredProposal } from "./comments-store";
import type { CommentEdits } from "./gavel-delivery";

/*
 * Pure projection between gavel's native comments and the comment components'
 * shape. `projectNative` reads any comment gavel holds (editor, CLI, agent,
 * extension, playground); `project` is the opt-in one for comments that carry
 * the playground's own metadata. Browser safe: the playground server and the
 * Chrome extension's gavel client both import it, so the mapping lives in one place.
 */

/** The workflow phase gavel files a thread under. */
export type CommentPhase = "active" | "awaiting_outcome" | "final";

export type Actor = { kind: string; id: string; label?: string };
export type Target = {
  uri: string;
  scopeUri: string;
  kind: string;
  label?: string;
  selector?: unknown;
};
type NativeMessage = {
  id: string;
  bodyMarkdown: string;
  author: Actor;
  createdAt: string;
  /** An agent's reply may carry only `proposal`; the playground fields are the web UI's own. */
  content?: Partial<Content> & { proposal?: NativeProposal };
};
/** A patch an agent proposed in a reply, as gavel stores it under the message's `content.proposal`. */
export type NativeProposal = Omit<StoredProposal, "decidedBy"> & { decidedBy?: Actor };
/** The hand-off gavel records under `content.agentRun`, in clicky-ui's CommentAgentRun shape. */
export type NativeAgentRun = {
  sessionId?: string;
  requestedAt: string;
  state: string;
  error?: string;
  target?: { label: string; channel?: string };
  /** The delivery's edits policy: a `propose` run answers with a proposal and never resolves the thread itself. */
  edits?: CommentEdits;
};
/** What a comment stored in `content`: the playground and extension write their own fields, and gavel records an agent hand-off. Editor, CLI and agent comments have none. */
export type Content = {
  /** The playground's own fields; only comments it wrote carry them. */
  playground?: Partial<StoredComment> & { page: string };
  /** The web page a browser extension commented on. */
  page?: { url: string; title: string };
  agentRun?: NativeAgentRun;
};
export type NativeComment = {
  id: string;
  bodyMarkdown: string;
  author: Actor;
  target: Target;
  status: string;
  phase: CommentPhase;
  /** Who holds the thread; a delivery assigns the agent it hands the thread to. */
  assignee?: Actor | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  content?: Content;
  messages?: NativeMessage[];
  attachments?: { id: string; name: string }[];
  outcome?: { at: string; actor: Actor };
};
export type Action = {
  id: string;
  expectedVersion: number;
  action: string;
  bodyMarkdown?: string;
  messageId?: string;
  content?: Content;
  target?: Target;
  assignee?: Actor | null;
  /** The resolution or closure summary. */
  summary?: string;
  evidence?: string[];
  /** `accept-proposal`: apply the proposed patch to the working tree or stage it in the index. */
  mode?: "apply" | "stage";
};

const AGENT_RUN_STATES: readonly StoredAgentRun["state"][] = ["queued", "sent", "done", "error"];

export function commentActor(author: StoredAuthor): Actor {
  return {
    kind: author.kind ?? "user",
    id: author.id ?? `${author.kind ?? "user"}:${author.name}`,
    label: author.name,
  };
}
export const localUser: StoredAuthor = { name: "You", kind: "user" };
export const bodyFor = (comment: StoredComment) =>
  comment.body.trim()
    ? comment.body
    : comment.reviewDecision === "approved"
      ? "Approved"
      : comment.rating === "positive"
        ? "Positive feedback"
        : "Negative feedback";
export function contentFor(page: string, comment: StoredComment): Content {
  const {
    id: _id,
    version: _version,
    rootId: _rootId,
    createdAt: _created,
    updatedAt: _updated,
    status: _status,
    parentId: _parent,
    ...fields
  } = comment;
  return { playground: { ...fields, page } };
}
function authorFor(actor: Actor): StoredAuthor {
  return {
    id: actor.id,
    name: actor.label ?? actor.id,
    kind: actor.kind === "agent" ? "agent" : "user",
  };
}
/** A proposal as the thread shows it: who decided it becomes an author. */
export function proposalFor(proposal: NativeProposal): StoredProposal {
  const { decidedBy, ...rest } = proposal;
  return { ...rest, ...(decidedBy ? { decidedBy: authorFor(decidedBy) } : {}) };
}
/** The first reply an agent wrote in the thread at or after the hand-off was requested. */
function firstAgentReply(messages: NativeMessage[], requestedAt: string): string | undefined {
  const since = Date.parse(requestedAt);
  const times = messages
    .filter((m) => m.author.kind === "agent" && Date.parse(m.createdAt) >= since)
    .map((m) => Date.parse(m.createdAt));
  return times.length > 0 ? new Date(Math.min(...times)).toISOString() : undefined;
}
function agentRunFor(run: NativeAgentRun, messages: NativeMessage[]): StoredAgentRun {
  if (!AGENT_RUN_STATES.includes(run.state as StoredAgentRun["state"]))
    throw new Error(`Unknown agent run state ${JSON.stringify(run.state)}; expected ${AGENT_RUN_STATES.join(", ")}`);
  const repliedAt = firstAgentReply(messages, run.requestedAt);
  return {
    ...(repliedAt ? { repliedAt } : {}),
    ...(run.sessionId ? { sessionId: run.sessionId } : {}),
    requestedAt: run.requestedAt,
    state: run.state as StoredAgentRun["state"],
    ...(run.error ? { error: run.error } : {}),
    ...(run.target ? { target: run.target } : {}),
    ...(run.edits ? { edits: run.edits } : {}),
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

/** The comment components' anchor, and the selected words kept beside it, for a gavel selector. A selector gavel would not have accepted throws. */
export function anchorOfSelector(selector: unknown): { anchor?: string; quote?: TextQuote } {
  if (selector === undefined || selector === null) return {};
  if (!isRecord(selector) || typeof selector.kind !== "string") throw new Error(`a target selector must be an object with a kind, got ${JSON.stringify(selector)}`);
  const quote = isRecord(selector.quote) ? { quote: selector.quote as TextQuote } : {};
  switch (selector.kind) {
    case "document":
      return {};
    case "code-range":
      if (!isRecord(selector.patch)) throw new Error("a code-range selector needs a patch");
      return { anchor: patchAnchor(selector.patch as PatchAnchor), ...quote };
    case "region":
      return { anchor: regionAnchor(selector.region as RegionAnchor) };
    case "dom":
      if (typeof selector.anchor !== "string" || selector.anchor === "") throw new Error("a dom selector needs an anchor");
      return { anchor: selector.anchor, ...quote };
    default:
      throw new Error(`unknown target selector kind ${JSON.stringify(selector.kind)}; expected document, code-range, region or dom`);
  }
}

const isoOf = (time: string) => new Date(time).toISOString();

/**
 * Any native thread in the comment components' shape, whoever wrote it: the
 * root, then its replies. Needs no playground metadata; the anchor and quote
 * come from the target's selector.
 */
export function projectNative(c: NativeComment): StoredComment[] {
  const { anchor, quote } = anchorOfSelector(c.target.selector);
  const root: StoredComment = {
    id: c.id,
    version: c.version,
    body: c.bodyMarkdown,
    author: authorFor(c.author),
    status: c.status,
    createdAt: isoOf(c.createdAt),
    ...(c.updatedAt !== c.createdAt ? { updatedAt: isoOf(c.updatedAt) } : {}),
    ...(c.assignee ? { assignee: authorFor(c.assignee) } : {}),
    ...(c.outcome ? { closedAt: isoOf(c.outcome.at), closedBy: authorFor(c.outcome.actor) } : {}),
    ...(anchor ? { anchor } : {}),
    ...(quote ? { quote } : {}),
    ...(c.content?.agentRun ? { agentRun: agentRunFor(c.content.agentRun, c.messages ?? []) } : {}),
  };
  return [
    root,
    ...(c.messages ?? []).map(
      (m): StoredComment => ({
        id: m.id,
        rootId: c.id,
        parentId: c.id,
        version: c.version,
        body: m.bodyMarkdown,
        author: authorFor(m.author),
        createdAt: isoOf(m.createdAt),
        anchor: root.anchor ?? null,
        ...(m.content?.proposal ? { proposal: proposalFor(m.content.proposal) } : {}),
      }),
    ),
  ];
}

/**
 * Opt-in projection for comments written by the playground or the extension,
 * which keep their own fields under `content.playground`; a comment without
 * them throws. `attachmentUrl` is where the host serves a comment's attachment: the playground proxies it, the extension reads gavel directly.
 */
export function project(
  c: NativeComment,
  options: { attachmentUrl: (commentId: string, attachmentId: string) => string },
): StoredComment[] {
  const playground = c.content?.playground;
  if (!playground?.page)
    throw new Error(`Comment ${c.id} is missing playground metadata`);
  // Gavel owns the assignee; a copy left in the playground fields is never the current one.
  const { page: _page, assignee: _assignee, ...fields } = playground;
  const capture = c.attachments?.find((a) => a.name === "screenshot.png");
  const root: StoredComment = {
    ...fields,
    id: c.id,
    version: c.version,
    body: fields.body === "" ? "" : c.bodyMarkdown,
    author: fields.author ?? authorFor(c.author),
    ...(c.assignee ? { assignee: authorFor(c.assignee) } : {}),
    status: c.status,
    createdAt: new Date(c.createdAt).toISOString(),
    ...(c.updatedAt !== c.createdAt
      ? { updatedAt: new Date(c.updatedAt).toISOString() }
      : {}),
    ...(c.outcome
      ? {
          closedAt: new Date(c.outcome.at).toISOString(),
          closedBy: fields.closedBy ?? authorFor(c.outcome.actor),
        }
      : {}),
    ...(capture && fields.element
      ? {
          element: {
            ...fields.element,
            screenshot: {
              status: "captured",
              filename: "screenshot.png",
              url: options.attachmentUrl(c.id, capture.id),
            },
          },
        }
      : {}),
    ...(c.content?.agentRun ? { agentRun: agentRunFor(c.content.agentRun, c.messages ?? []) } : {}),
  };
  return [
    root,
    ...(c.messages ?? []).map((m) => ({
      ...m.content?.playground,
      ...(m.content?.proposal ? { proposal: proposalFor(m.content.proposal) } : {}),
      id: m.id,
      rootId: c.id,
      version: c.version,
      body: m.bodyMarkdown,
      author: m.content?.playground?.author ?? authorFor(m.author),
      createdAt: new Date(m.createdAt).toISOString(),
      parentId: c.id,
      anchor: root.anchor ?? null,
    })),
  ];
}
