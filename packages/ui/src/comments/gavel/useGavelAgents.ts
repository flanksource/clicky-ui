import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Comment } from "../comment-types";
import type { GavelCommentsClient } from "./client";
import { ownLayerOf } from "./comment-agent-model";
import { commentAgentFor, type CommentAgent, type CommentAgentPatch, type CommentAgentSettings, type CommentEdits, type GavelAgentSession, type RunDeliverTarget, type SettingsRef } from "./gavel-delivery";

const SESSION_POLL_MS = 5000;

function describe(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

export type GavelAgentsOptions = {
  client: GavelCommentsClient;
  /** The target whose comment agent rule this edits; `undefined` until the host knows what it is commenting on. */
  target: string | undefined;
  /** The run auto-run starts for the target. Describes a run, never a live session. */
  run?: RunDeliverTarget;
};

export type SaveAgentInput = {
  /** Defaults to `ownLayer`: the project's settings file, or its database layer when it has none. */
  layer?: SettingsRef;
  /** `false` saves the layer's default instead of the target's own entry. */
  page?: boolean;
  /** A JSON merge patch gavel applies to the layer's entry: a field present replaces it, one set to `null` removes it so it inherits, and `null` deletes the whole entry. */
  agent: CommentAgentPatch | null;
};

/** `derived` without the run fields `existing` already sets, so enabling auto-run never overwrites a prompt or group the CLI chose. */
function unsetRunFields(derived: CommentAgent, existing: CommentAgent): CommentAgentPatch {
  return Object.fromEntries(Object.entries(derived).filter(([field]) => field === "enabled" || existing[field as keyof CommentAgent] === undefined));
}

/**
 * The comment agent rule gavel resolves for one target, each field traced to
 * the settings layer that set it, and the writes that change it. Auto-run (the
 * rule's `enabled`) and `edits` are independent: choosing how an agent edits
 * never turns auto-run on or off. Every write is a merge patch of only the
 * fields it changes, saved at `ownLayer`, so what the CLI or a settings file
 * set on the entry is never rewritten.
 */
export function useGavelAgents(options: GavelAgentsOptions) {
  const { client, target, run } = options;
  const [resolved, setResolved] = useState<CommentAgentSettings>();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(resolved);
  latest.current = resolved;
  const rule = resolved?.agent;
  const enabled = rule?.agent.enabled === true;
  const edits: CommentEdits = rule?.agent.edits ?? "direct";
  const own = useMemo(() => {
    if (!resolved) return undefined;
    try {
      return { layer: ownLayerOf(resolved.settings) };
    } catch (cause) {
      return { failure: describe(cause) };
    }
  }, [resolved]);
  const ownLayer = own && "layer" in own ? own.layer : undefined;

  useEffect(() => {
    if (target === undefined) return;
    let cancelled = false;
    setReady(false);
    setResolved(undefined);
    client.commentAgent(target).then(
      (settings) => {
        if (cancelled) return;
        setResolved(settings);
        setError(null);
        setReady(true);
      },
      (cause: unknown) => {
        if (!cancelled) setError(describe(cause));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [client, target]);

  /**
   * Patches the target's entry at `layer` with `agent`, a JSON merge patch gavel
   * applies under its lock, and returns the settings gavel then resolves.
   */
  const save = useCallback(
    async (input: SaveAgentInput): Promise<CommentAgentSettings> => {
      if (target === undefined) throw new Error("The host has not reported what it is commenting on yet");
      const layer = input.layer ?? (latest.current ? ownLayerOf(latest.current.settings) : undefined);
      if (!layer) throw new Error("The comment agent has not loaded, so there is no settings layer to save to yet");
      const saved = await client.saveCommentAgent({ uri: target, layer, ...(input.page === undefined ? {} : { page: input.page }), agent: input.agent });
      latest.current = saved;
      setResolved(saved);
      setError(null);
      return saved;
    },
    [client, target],
  );

  /**
   * Whether gavel starts an agent run for every new human comment on the
   * target. Turning it on patches `enabled` and only the run fields the entry
   * does not already set; turning it off patches `enabled: false` alone, which
   * also overrides a default that would still enable the target. A failed save
   * is reported through `error` and leaves the previous state.
   */
  const setEnabled = useCallback(
    async (on: boolean) => {
      if (on && !run) throw new Error("The host has not reported a run target yet");
      try {
        await save({ agent: on && run ? unsetRunFields(commentAgentFor(run), latest.current?.agent.agent ?? {}) : { enabled: false } });
      } catch (cause) {
        setError(describe(cause));
      }
    },
    [save, run],
  );

  /** How the agent changes the project: edits it directly or proposes patches. Patches `edits` alone, so it never turns auto-run on or off. */
  const setEdits = useCallback(
    async (next: CommentEdits) => {
      try {
        await save({ agent: { edits: next } });
      } catch (cause) {
        setError(describe(cause));
      }
    },
    [save],
  );

  return { agent: rule, settings: resolved?.settings, session: resolved?.session, ownLayer, enabled, edits, ready, error: error ?? (own && "failure" in own ? own.failure : null), save, setEnabled, setEdits };
}

/** What `useGavelAgents` returns: the target's resolved comment agent and the writes that change it. */
export type GavelAgents = ReturnType<typeof useGavelAgents>;

/**
 * The agent sessions threads can be delivered to (live, plus ended managed ones
 * that a delivery resumes), refreshed while the page is visible and on demand
 * through `refresh`, which settles once the reload has been applied.
 */
export function useAgentSessions(client: GavelCommentsClient): { sessions: GavelAgentSession[] | undefined; error: string | null; refresh: () => Promise<void> } {
  const [sessions, setSessions] = useState<GavelAgentSession[]>();
  const [error, setError] = useState<string | null>(null);
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const mine = ++generation.current;
    try {
      const next = await client.agentSessions();
      if (mine === generation.current) {
        setSessions(next);
        setError(null);
      }
    } catch (cause) {
      if (mine === generation.current) setError(describe(cause));
    }
  }, [client]);
  useEffect(() => {
    const update = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    void refresh();
    const timer = window.setInterval(update, SESSION_POLL_MS);
    window.addEventListener("focus", update);
    return () => {
      generation.current++;
      window.clearInterval(timer);
      window.removeEventListener("focus", update);
    };
  }, [refresh]);
  return { sessions, error, refresh };
}

type WatchedThread = { id: string; requestedAt: string | undefined };

/**
 * Gavel records a run's session on the delivered thread after the deliver
 * request has answered, so it arrives with the thread's comment stream, not in
 * the response. `watch` the delivered thread ids and `adopt` is called once with
 * the first session recorded by that hand-off (a hand-off is recognised by its
 * `requestedAt` differing from the one the thread had when watched, so a session
 * an earlier run left is never adopted). A thread whose hand-off failed stops
 * being watched; `cancel` stops all.
 */
export function useAdoptRunSession(options: { comments: Pick<Comment, "id" | "agentRun">[]; adopt: (sessionId: string) => void }) {
  const { comments } = options;
  const [watched, setWatched] = useState<WatchedThread[]>([]);
  const latest = useRef(comments);
  latest.current = comments;
  const adopt = useRef(options.adopt);
  adopt.current = options.adopt;

  useEffect(() => {
    if (watched.length === 0) return;
    const recorded = new Map(comments.map((comment) => [comment.id, comment.agentRun]));
    const handedOff = (thread: WatchedThread) => {
      const run = recorded.get(thread.id);
      return run && run.requestedAt !== thread.requestedAt ? run : undefined;
    };
    const adopted = watched.map(handedOff).find((run) => run?.sessionId);
    if (adopted?.sessionId) {
      setWatched([]);
      adopt.current(adopted.sessionId);
      return;
    }
    const pending = watched.filter((thread) => handedOff(thread)?.state !== "error");
    if (pending.length !== watched.length) setWatched(pending);
  }, [comments, watched]);

  const watch = useCallback((ids: string[]) => {
    setWatched(ids.map((id) => ({ id, requestedAt: latest.current.find((comment) => comment.id === id)?.agentRun?.requestedAt })));
  }, []);
  const cancel = useCallback(() => setWatched([]), []);
  return { watch, cancel };
}
