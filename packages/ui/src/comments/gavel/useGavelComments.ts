import { randomUUID } from "../../lib/random-uuid";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CommentAuthor, CommentReplyInput } from "../comment-types";
import type { GitDiffPayload } from "../../data/git/types";
import type { CreateCommentRequest, GavelCommentsClient, ListFilter } from "./client";
import { watchCommentEvents, type CursorStore } from "./comment-events";
import type { StoredComment } from "./comments-store";
import type { DeliverTarget } from "./gavel-delivery";
import { commentActor, localUser, projectNative, type NativeComment, type Target } from "./gavel-projection";

function describe(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

/** A thread comment as the hook returns it: an optimistic one carries its delivery state. */
export type GavelComment = StoredComment & { submission?: { state: "sending" | "failed"; error?: string } };

/** The fields of a new comment shown while it is being sent; the hook adds its id, time and author. */
export type CommentPreview = Omit<StoredComment, "id" | "createdAt" | "author" | "submission">;

export type GavelCommentsOptions = {
  client: GavelCommentsClient;
  /** What to list; `undefined` lists nothing (the host has no target yet), `{}` lists the whole scope. */
  filter: ListFilter | undefined;
  /**
   * Turns a native thread into the comment components' shape. Defaults to
   * `projectNative`, which reads any thread (editor, CLI, agent, extension,
   * playground); pass `project` (from `gavel-projection`) for the playground's
   * own metadata.
   */
  project?: (comment: NativeComment) => StoredComment[];
  /** The structured `content` a reply is stored with. */
  replyContent?: (input: CommentReplyInput) => Record<string, unknown>;
  cursor?: CursorStore;
  /** Wait before reopening a closed event stream. */
  reconnectMs?: number;
  /** Wait that coalesces a burst of events into one reload. */
  debounceMs?: number;
};

export type GavelComments = {
  comments: GavelComment[];
  loading: boolean;
  /** A broken backend or event stream must never look like "no comments". */
  error: string | null;
  refresh: () => Promise<void>;
  /**
   * Creates a thread root. `preview` is shown at once as sending; gavel's
   * stored thread replaces it. A refused create stays visible as failed until
   * it is discarded. Resolves to the stored thread's id.
   */
  create: (input: { preview: CommentPreview; request: CreateCommentRequest; screenshot?: Uint8Array | Blob }) => Promise<string>;
  /** Drops a pending comment that failed. */
  discard: (pendingId: string) => void;
  reply: (input: CommentReplyInput) => Promise<void>;
  /** Replaces the body of a root or of a reply. */
  edit: (id: string, body: string) => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  acknowledge: (id: string) => Promise<void>;
  assign: (id: string, assignee: CommentAuthor | null) => Promise<void>;
  close: (id: string) => Promise<void>;
  /** Moves a thread to another target within its scope (a re-anchor). */
  retarget: (id: string, target: Target) => Promise<void>;
  /** Deletes a root, or a reply through its root. */
  remove: (id: string) => Promise<void>;
  /** Applies the patch proposed in reply `id` to the working tree, or stages it in the index. */
  applyProposal: (id: string, mode: "apply" | "stage") => Promise<void>;
  rejectProposal: (id: string, reason?: string) => Promise<void>;
  /** Asks the proposer to revise; gavel hands the thread back to its agent session. */
  requestRevision: (id: string, feedback: string) => Promise<void>;
  loadProposalDiff: (id: string) => Promise<GitDiffPayload>;
  /** Hands a thread to an agent and returns gavel's recorded hand-off. */
  deliver: (id: string, target: DeliverTarget) => Promise<NativeComment>;
  /** Hands several open thread roots to one target in a single batch; gavel refuses the whole batch if one is stale or closed. */
  deliverAll: (ids: string[], target: DeliverTarget) => Promise<NativeComment[]>;
  /** Marks every thread on the filtered target read. */
  markRead: () => Promise<void>;
};

type Pending = { filterKey: string; comment: GavelComment };

/**
 * The threads matching `filter`, held in gavel: loaded through the client,
 * kept current by the scope's event stream (resumed from a stored cursor),
 * written optimistically for new comments, and mutated at the version each
 * thread was last seen.
 *
 * Reloads are numbered, so only the newest one applies, and one that finishes
 * while a post is in flight is not lost: it is marked stale and run again
 * once posting settles. Every function typed as a promise rejects rather than
 * throwing synchronously.
 */
export function useGavelComments(options: GavelCommentsOptions): GavelComments {
  const { client, filter } = options;
  const filterKey = filter === undefined ? undefined : JSON.stringify(filter);
  const [stored, setStored] = useState<StoredComment[]>([]);
  const [outbox, setOutbox] = useState<Pending[]>([]);
  const [loading, setLoading] = useState(filter !== undefined);
  const [error, setError] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const latest = useRef(stored);
  const filterRef = useRef({ filter, filterKey });
  const configured = useRef(options);
  useLayoutEffect(() => {
    latest.current = stored;
    filterRef.current = { filter, filterKey };
    configured.current = options;
  }, [stored, filter, filterKey, options]);
  const posting = useRef(0);
  const mutationVersion = useRef(0);
  const generation = useRef(0);
  /** A reload was skipped or discarded while posting was in flight and must run again once it settles. */
  const stale = useRef(false);

  const projectNativeComment = useCallback((comment: NativeComment) => (configured.current.project ?? projectNative)(comment), []);

  const refresh = useCallback(async () => {
    const current = filterRef.current;
    if (current.filter === undefined) return;
    if (posting.current > 0) {
      stale.current = true;
      return;
    }
    const mine = ++generation.current;
    const version = mutationVersion.current;
    const outdated = () => mine !== generation.current || filterRef.current.filterKey !== current.filterKey;
    try {
      const rows = await client.list(current.filter);
      if (outdated()) return;
      if (posting.current > 0 || version !== mutationVersion.current) {
        stale.current = true;
        return;
      }
      setStored(rows.flatMap(projectNativeComment));
      setError(null);
      setLoading(false);
    } catch (cause) {
      if (outdated()) return;
      setError(describe(cause));
      setLoading(false);
    }
  }, [client, projectNativeComment]);

  /** Runs the reload that was skipped or discarded while posting was in flight. */
  const settlePosting = useCallback(() => {
    posting.current--;
    mutationVersion.current++;
    if (posting.current === 0 && stale.current) {
      stale.current = false;
      void refresh();
    }
  }, [refresh]);

  useEffect(() => {
    setStored([]);
    setLoading(filterKey !== undefined);
    void refresh();
  }, [refresh, filterKey]);

  useEffect(
    () =>
      watchCommentEvents({
        client,
        cursor: configured.current.cursor,
        reconnectMs: configured.current.reconnectMs,
        debounceMs: configured.current.debounceMs,
        onChange: () => void refresh(),
        onStatus: setStreamError,
      }),
    [client, refresh],
  );

  const loadedComment = (id: string): StoredComment => {
    const comment = latest.current.find((entry) => entry.id === id);
    if (!comment) throw new Error(`Comment ${id} is not loaded; refresh and try again`);
    return comment;
  };
  const root = (id: string): StoredComment & { version: number } => {
    const comment = loadedComment(id);
    if (comment.parentId) throw new Error("Only thread roots can change lifecycle stage");
    if (comment.version === undefined) throw new Error(`Comment ${id} has no gavel version`);
    return { ...comment, version: comment.version };
  };
  /** The thread root a loaded comment belongs to, and the comment itself. */
  const rootOf = (id: string) => {
    const comment = loadedComment(id);
    return { comment, thread: root(comment.parentId ? (comment.rootId ?? comment.parentId) : id) };
  };
  const mutate = async (work: () => Promise<unknown>) => {
    await work();
    await refresh();
  };
  /** The loaded reply `id` and the thread root a proposal decision is addressed to. */
  const proposalReply = (id: string) => {
    const reply = loadedComment(id);
    if (!reply.parentId) throw new Error(`Comment ${id} is not a reply, so it carries no proposal`);
    return { rootId: reply.rootId ?? reply.parentId };
  };
  const decide = async <T,>(id: string, run: (thread: { id: string; version: number }) => Promise<T>) => {
    const thread = root(proposalReply(id).rootId);
    await mutate(() => run({ id: thread.id, version: thread.version }));
  };
  const lifecycle = async (id: string, action: "resolve" | "reopen" | "close" | "acknowledge") => {
    const comment = root(id);
    await mutate(() => client.status({ id, version: comment.version, action }));
  };
  const settled = async <T,>(work: Promise<T>): Promise<T> => {
    try {
      return await work;
    } finally {
      // A failed delivery is recorded on the thread's agentRun, so it is reloaded either way.
      await refresh();
    }
  };

  const comments = useMemo(
    () => [...stored, ...outbox.filter((entry) => entry.filterKey === filterKey).map((entry) => entry.comment)],
    [stored, outbox, filterKey],
  );

  return {
    comments,
    loading,
    error: error ?? streamError,
    refresh,
    create: async ({ preview, request, screenshot }) => {
      if (filterKey === undefined) throw new Error("Cannot create a comment before the host has said what it is commenting on");
      const pendingId = `pending-${randomUUID()}`;
      const comment: GavelComment = { ...preview, id: pendingId, createdAt: new Date().toISOString(), author: localUser, submission: { state: "sending" } };
      setOutbox((previous) => [...previous, { filterKey, comment }]);
      posting.current++;
      mutationVersion.current++;
      try {
        const saved = await client.create({ request, ...(screenshot ? { screenshot } : {}) });
        const rows = projectNativeComment(saved);
        // The saved thread belongs to the filter it was created under; a reload for the current one lists it if it matches.
        if (filterRef.current.filterKey === filterKey) setStored((previous) => [...previous.filter((entry) => entry.id !== saved.id && entry.rootId !== saved.id), ...rows]);
        setOutbox((previous) => previous.filter((entry) => entry.comment.id !== pendingId));
        return saved.id;
      } catch (cause) {
        const message = describe(cause);
        setOutbox((previous) => previous.map((entry) => (entry.comment.id === pendingId ? { ...entry, comment: { ...entry.comment, submission: { state: "failed", error: message } } } : entry)));
        throw cause;
      } finally {
        settlePosting();
      }
    },
    discard: (pendingId) => {
      if (!outbox.some((entry) => entry.comment.id === pendingId)) throw new Error(`Comment ${pendingId} is not a pending comment`);
      setOutbox((previous) => previous.filter((entry) => entry.comment.id !== pendingId));
    },
    reply: async (input) => {
      const { thread } = rootOf(input.parentId);
      const content = configured.current.replyContent?.(input);
      await mutate(() => client.reply({ id: thread.id, version: thread.version, body: input.body, ...(content ? { content } : {}) }));
    },
    edit: async (id, body) => {
      const { comment, thread } = rootOf(id);
      await mutate(() => (comment.parentId ? client.editReply({ id: thread.id, version: thread.version, messageId: id, body }) : client.update({ id, version: thread.version, body })));
    },
    updateStatus: async (id, status) => {
      if (status === "resolved") return lifecycle(id, "resolve");
      if (status === "open") return lifecycle(id, "reopen");
      throw new Error(`Status ${JSON.stringify(status)} cannot be set directly; use acknowledge, assign, resolve or reopen`);
    },
    acknowledge: (id) => lifecycle(id, "acknowledge"),
    assign: async (id, assignee) => {
      const comment = root(id);
      await mutate(() => client.assign({ id, version: comment.version, assignee: assignee ? commentActor(assignee) : null }));
    },
    close: (id) => lifecycle(id, "close"),
    retarget: async (id, target) => {
      const comment = root(id);
      await mutate(() => client.retarget({ id, version: comment.version, target }));
    },
    remove: async (id) => {
      const { comment, thread } = rootOf(id);
      await mutate(() => (comment.parentId ? client.deleteReply({ id: thread.id, version: thread.version, messageId: id }) : client.remove({ id, version: thread.version })));
    },
    applyProposal: (id, mode) => decide(id, (thread) => client.applyProposal({ ...thread, messageId: id, mode })),
    rejectProposal: (id, reason) => decide(id, (thread) => client.rejectProposal({ ...thread, messageId: id, ...(reason ? { reason } : {}) })),
    requestRevision: (id, feedback) => decide(id, (thread) => client.requestRevision({ ...thread, messageId: id, feedback })),
    loadProposalDiff: async (id) => client.proposalDiff(proposalReply(id).rootId, id),
    deliver: async (id, target) => {
      const comment = root(id);
      return settled(client.deliver({ id, version: comment.version, requestId: randomUUID(), target }));
    },
    deliverAll: async (ids, target) => {
      const threads = ids.map((id) => ({ id, expectedVersion: root(id).version }));
      return settled(client.deliverBatch({ requestId: randomUUID(), target, threads }));
    },
    markRead: async () => {
      const uri = filter?.target;
      if (uri === undefined) throw new Error("Marking comments read needs a target filter; this one lists the whole scope");
      await client.markRead(uri);
      await refresh();
    },
  };
}
