import { useCallback, useEffect, useRef, useState } from "react";
import type { GavelCommentsClient, ListFilter } from "./client";
import { watchCommentEvents, type CursorStore } from "./comment-events";
import type { InboxListing } from "./inbox-model";

function describe(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

/** One gavel project the inbox lists: its name as the inbox shows and filters it, and the client for its scope. */
export type InboxSource = { project: string; client: GavelCommentsClient };

export type GavelInboxOptions = {
  /** Keep this array stable (memoize it); the inbox reloads and reopens its streams when its sources change. */
  sources: readonly InboxSource[];
  /** What each scope lists; the whole scope when omitted. */
  filter?: ListFilter;
  cursor?: CursorStore;
  /** Wait before reopening a closed event stream. */
  reconnectMs?: number;
  /** Wait that coalesces a burst of events into one reload. */
  debounceMs?: number;
};

export type GavelInbox = {
  /** One listing per source, as gavel returns it; `undefined` until the first load completes. */
  listings: InboxListing[] | undefined;
  /** A failed load, reload or event stream. A broken backend must never look like an empty inbox. */
  error: string | null;
  refresh: () => Promise<void>;
  /** Marks every thread on `uri` read for the caller, then reloads. */
  markRead: (target: { scope: string; uri: string }) => Promise<void>;
};

const sourcesKey = (sources: readonly InboxSource[]) => sources.map(({ project, client }) => `${client.baseUrl}|${client.scope}|${project}`).join("\n");

/**
 * The data a `CommentInbox` shows: each source's threads listed through its
 * client, reloaded when any scope's event stream reports a change, and a way to
 * mark a target read. Keep the component presentational: pass `listings` and
 * `error` to it and `markRead` through its actions.
 */
export function useGavelInbox(options: GavelInboxOptions): GavelInbox {
  const { sources } = options;
  const key = sourcesKey(sources);
  const [listings, setListings] = useState<InboxListing[]>();
  const [error, setError] = useState<string | null>(null);
  /** Each scope's stream status, so one reopening never hides another's failure. */
  const [streamErrors, setStreamErrors] = useState<Record<string, string | null>>({});
  const configured = useRef(options);
  configured.current = options;
  const generation = useRef(0);

  const refresh = useCallback(async () => {
    const mine = ++generation.current;
    const { sources: current, filter } = configured.current;
    try {
      const next = await Promise.all(current.map(async ({ project, client }): Promise<InboxListing> => ({ scope: client.scope, project, threads: await client.list(filter ?? {}) })));
      if (mine !== generation.current) return;
      setListings(next);
      setError(null);
    } catch (cause) {
      if (mine === generation.current) setError(describe(cause));
    }
  }, []);

  useEffect(() => {
    setListings(undefined);
    void refresh();
  }, [refresh, key]);

  useEffect(() => {
    const stops = configured.current.sources.map(({ client }) =>
      watchCommentEvents({
        client,
        cursor: configured.current.cursor,
        reconnectMs: configured.current.reconnectMs,
        debounceMs: configured.current.debounceMs,
        onChange: () => void refresh(),
        onStatus: (stopped) => setStreamErrors((previous) => ({ ...previous, [client.scope]: stopped })),
      }),
    );
    return () => stops.forEach((stop) => stop());
  }, [refresh, key]);

  const markRead = useCallback(
    async ({ scope, uri }: { scope: string; uri: string }) => {
      const source = configured.current.sources.find(({ client }) => client.scope === scope);
      if (!source) throw new Error(`The inbox has no source for scope ${scope}, so ${uri} cannot be marked read`);
      await source.client.markRead(uri);
      await refresh();
    },
    [refresh],
  );

  return { listings, error: error ?? Object.values(streamErrors).find((stopped) => stopped !== null) ?? null, refresh, markRead };
}
