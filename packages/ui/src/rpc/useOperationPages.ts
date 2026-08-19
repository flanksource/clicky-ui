import { useCallback, useEffect, useMemo } from "react";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";

import type { DataTableInfinite } from "../data/DataTable";
import { cursorParameterName, isCursorStale } from "./cursorStale";
import { packParameterValues, type ParameterValues } from "./formMetadata";
import type {
  ExecutionResponse,
  OpenAPIParameter,
  ResolvedOperation,
} from "./types";
import type { OperationsApiClient } from "./useOperations";

const LIST_KEY = "operation-list";
const CLICKY_HEADERS = { Accept: "application/json+clicky" };

export type OperationPagesOptions = {
  client: OperationsApiClient;
  /** The list operation, or undefined for a surface that has none. */
  endpoint: ResolvedOperation | undefined;
  /** Every parameter the operation declares — the source of the cursor role. */
  parameters: OpenAPIParameter[];
  /** Current filter/pagination state, as the catalog holds and URL-mirrors it. */
  filters: ParameterValues;
};

export type OperationPages = {
  /** Every page fetched so far, oldest first. One entry outside a walk. */
  pages: ExecutionResponse[];
  /** The newest page — what every renderer means by "the response". */
  response: ExecutionResponse | null;
  /** True while the whole result is being replaced, not while it is growing. */
  isFetching: boolean;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  /** Re-runs the list. A walk restarts rather than replaying its cursors. */
  refetch: () => void;
  /** Load-more handle; absent unless the operation can walk by cursor. */
  infinite?: DataTableInfinite;
};

/**
 * useOperationPages runs a surface's list operation, walking it forward when it
 * declares a cursor and fetching a single page when it does not.
 *
 * The mode is the operation's to decide, not the caller's: a cursor role is the
 * server saying "you may resume this query", and everything else — the majority
 * of surfaces — keeps the single-page query it has always had, replacing its
 * rows when the offset moves.
 *
 * In walk mode the cursor is deliberately absent from the query key. The key is
 * the identity of the query being walked, and the cursor is a position inside
 * it; keying on it made every page a different query, which is precisely why
 * advancing replaced the rows instead of extending them. Every other filter
 * stays in the key, so any filter, parameter or time-range change starts a new
 * walk on its own, with no reset logic layered on top.
 */
export function useOperationPages({
  client,
  endpoint,
  parameters,
  filters,
}: OperationPagesOptions): OperationPages {
  const queryClient = useQueryClient();
  const cursorParam = cursorParameterName(parameters);
  const path = endpoint?.path;
  const method = endpoint?.method;

  // The walk's own view of the filters: everything that identifies the query,
  // with the position taken out. A cursor left over in the URL from a shared
  // link names a position in a walk this session never made, so it is dropped
  // rather than replayed.
  const walkFilters = useMemo(() => {
    if (!cursorParam) return filters;
    const rest = { ...filters };
    delete rest[cursorParam];
    return rest;
  }, [cursorParam, filters]);

  const execute = useCallback(
    (values: ParameterValues) =>
      client.executeCommand(
        path!,
        method!,
        packParameterValues(values, parameters),
        CLICKY_HEADERS,
      ),
    [client, method, parameters, path],
  );

  // Both queries are declared on every render — hooks are not conditional — and
  // exactly one is enabled. Their keys differ in shape as well as content, so a
  // surface that switches modes can never read a page array as a page.
  const single = useQuery<ExecutionResponse>({
    queryKey: [LIST_KEY, method, path, filters],
    queryFn: () => execute(filters),
    enabled: !!endpoint && !cursorParam,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 0,
  });

  // Prefixed with the same LIST_KEY as the single-page query: host apps
  // invalidate ["operation-list"] after a mutation, and a walk that fell
  // outside that prefix would keep serving rows the mutation changed.
  const walkKey = useMemo(
    () => [LIST_KEY, "walk", method, path, walkFilters],
    [method, path, walkFilters],
  );

  const walk = useInfiniteQuery<
    ExecutionResponse,
    Error,
    InfiniteData<ExecutionResponse, string | undefined>,
    QueryKey,
    string | undefined
  >({
    queryKey: walkKey,
    queryFn: ({ pageParam }) =>
      execute(pageParam ? { ...walkFilters, [cursorParam!]: pageParam } : walkFilters),
    initialPageParam: undefined,
    // The server's two answers, both required: it has more, and here is where
    // to resume. A page claiming more without minting a token cannot be walked,
    // and guessing one is how a client forges a position it was never given.
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasMore ? lastPage.pagination.nextCursor : undefined,
    enabled: !!endpoint && !!cursorParam,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 0,
  });

  const walkPages = walk.data?.pages;

  // A cursor the server refuses is recoverable by construction: the query is
  // fine and only the position is gone, so the walk starts again instead of
  // stranding the reader on an error panel they cannot page out of. Resetting
  // is what does it — refetching would replay the very cursors that were
  // refused, page by page.
  //
  // Guarded on a page having already been fetched, because only then can a
  // cursor have been sent. A first page refused this way is a server that
  // answers `cursor_stale` to a request carrying no cursor, and restarting on
  // that spins: refuse, restart, refuse.
  const staleWalk = isCursorStale(walk.error) && (walkPages?.length ?? 0) > 0;

  useEffect(() => {
    if (!staleWalk) return;
    void queryClient.resetQueries({ queryKey: walkKey });
  }, [queryClient, staleWalk, walkKey]);

  const fetchNextPage = walk.fetchNextPage;
  const infinite = useMemo<DataTableInfinite | undefined>(() => {
    if (!cursorParam) return undefined;
    return {
      hasMore: walk.hasNextPage,
      loading: walk.isFetchingNextPage,
      onLoadMore: () => void fetchNextPage(),
    };
  }, [cursorParam, fetchNextPage, walk.hasNextPage, walk.isFetchingNextPage]);

  const resetWalk = useCallback(() => {
    void queryClient.resetQueries({ queryKey: walkKey });
  }, [queryClient, walkKey]);
  const refetchSingle = single.refetch;

  if (!cursorParam) {
    return {
      pages: single.data ? [single.data] : [],
      response: single.data ?? null,
      isFetching: single.isFetching,
      isPending: single.isPending,
      isError: single.isError,
      error: single.error,
      refetch: () => void refetchSingle(),
    };
  }

  const pages = walkPages ?? [];
  return {
    pages,
    response: pages[pages.length - 1] ?? null,
    // Fetching the next page grows the run; it does not replace it. Reporting
    // it as a load of the whole surface is what drops a spinner over rows the
    // reader is still reading.
    isFetching: walk.isFetching && !walk.isFetchingNextPage,
    isPending: walk.isPending,
    isError: walk.isError && !staleWalk,
    error: staleWalk ? undefined : walk.error,
    // A mutation just changed the rows this walk was cut from, so its cursors
    // no longer name positions in it. Starting over is the only honest refetch.
    refetch: resetWalk,
    ...(infinite ? { infinite } : {}),
  };
}
