import { useMemo, useRef, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "../../../rpc/router";
import { searchParams, type SearchResult, type SearchValues, type Source, type Trace } from "./api";
import { browserHref, mergePinned, readBrowserLocation, withoutPinned, type BrowserLocation } from "./browser-state";
import { OtelTraceDetail } from "./OtelTraceDetail";
import { OtelTraceSearch } from "./OtelTraceSearch";

export interface OtelTraceBrowserProps {
  /**
   * The trace query endpoint: `GET {baseUrl}?<search values>` returns a SearchResult and
   * `GET {baseUrl}/{traceId}?<source, index, format>` returns a Trace (the tracequery contract).
   * Requests are same-origin `fetch`es, so cookies carry the session.
   */
  baseUrl: string;
  /** The places traces are searched. At least one is required unless `allowRecords` is set. */
  sources: Source[];
  /** Search values applied when the URL carries none of its own. With one source, `source` defaults to it. */
  defaults?: SearchValues;
  /**
   * Search values merged into every request and every change, so they can never be removed.
   * They are shown as locked in the filter bar and are left out of the URL, which the page's own props already supply.
   */
  pinned?: SearchValues;
  /** Offers the recorded-spans source beside `sources`. Defaults to false: the endpoint is a connection's trace query. */
  allowRecords?: boolean;
  /** When a search finds exactly one trace, opens it by replacing the search's history entry. */
  autoOpenSingle?: boolean;
}

const NONE: SearchValues = {};
const SEARCH_KEY = "otel-traces";
const TRACE_KEY = "otel-trace";

async function read<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error((await response.text()).trim() || `${response.status} ${response.statusText}`.trim());
  return response.json() as Promise<T>;
}

const searchOf = (href: string) => (href.includes("?") ? href.slice(href.indexOf("?")) : "");
const urlKey = (values: SearchValues) => searchParams(values).toString();

/** The browser's location read as search values, or the reason it cannot be. */
function parseLocation(search: string): BrowserLocation | { error: string } {
  try {
    return readBrowserLocation(search);
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Searches traces and opens one in a waterfall: the stateful container around OtelTraceSearch and OtelTraceDetail.
 *
 * Search values, the open trace and the selected span live in the query string, next to whatever query keys and path
 * the host page uses, so it works as a tab of a larger page. It needs a react-query `QueryClientProvider` and a router
 * that reflects `window.location` (the default browser adapter, or a RouterProvider over a real router).
 */
export function OtelTraceBrowser({ baseUrl, sources, defaults = NONE, pinned = NONE, allowRecords = false, autoOpenSingle = false }: OtelTraceBrowserProps) {
  if (!allowRecords && sources.length === 0) throw new Error("OtelTraceBrowser needs at least one source, or allowRecords");
  const { navigate, pathname, renderLink } = useRouter();
  const client = useQueryClient();
  const baseValues: SearchValues = { ...(allowRecords ? {} : { source: sources[0]!.id }), ...defaults };

  const locationSearch = window.location.search;
  const location = useMemo(() => parseLocation(locationSearch), [locationSearch]);
  const [state, setState] = useState(() => ({ search: locationSearch, values: { ...baseValues, ...("error" in location ? {} : location.values) } }));
  if (state.search !== locationSearch && !("error" in location)) {
    setState({ search: locationSearch, values: { ...baseValues, ...location.values } });
  }
  const values = mergePinned(state.values, pinned);
  const trace = "error" in location ? undefined : location.trace;
  const span = "error" in location ? undefined : location.span;

  const hrefFor = (next: SearchValues, to?: { trace: string; span?: string }) =>
    browserHref({ pathname, search: window.location.search, values: next, pinned, defaults: baseValues, trace: to?.trace, span: to?.span });

  const scope = [baseUrl, values.source, values.run, values.index, values.format] as const;
  const search = useQuery<SearchResult>({
    queryKey: [SEARCH_KEY, ...scope, values], enabled: !trace && !("error" in location), retry: false,
    placeholderData: (previous, query) =>
      scope.every((part, index) => query?.queryKey[index + 1] === part) ? previous : undefined,
    queryFn: ({ signal }) => read<SearchResult>(`${baseUrl}?${searchParams(values)}`, signal),
  });
  const detail = useQuery({
    queryKey: [TRACE_KEY, ...scope, trace], enabled: !!trace, retry: false,
    queryFn: ({ signal }) => read<Trace>(`${baseUrl}/${encodeURIComponent(trace!)}?${searchParams({ source: values.source, run: values.run, index: values.index, format: values.format })}`, signal),
  });

  const autoOpened = useRef<string | undefined>(undefined);
  const only = search.data && !search.isPlaceholderData && !search.isFetching && search.data.total === 1 && search.data.traces.length === 1 ? search.data.traces[0]!.traceId : undefined;
  const searchKey = urlKey(values);
  useEffect(() => {
    if (!autoOpenSingle || trace || !only || autoOpened.current === searchKey) return;
    autoOpened.current = searchKey;
    navigate(hrefFor(state.values, { trace: only }), { replace: true });
  });

  if ("error" in location) return <div className="space-y-3">
    <p role="alert">Invalid trace search URL: {location.error}</p>
    {renderLink({ to: browserHref({ pathname, search: locationSearch, values: {}, pinned }), children: "Clear search", className: "underline" })}
  </div>;

  if (trace) return <div className="min-w-0 space-y-3">
    {renderLink({ to: hrefFor(state.values), children: "Back to trace search", className: "text-sm underline" })}
    {detail.isPending && <p role="status">Loading trace…</p>}
    {detail.error && <p role="alert">{detail.error.message}</p>}
    {detail.data && <OtelTraceDetail trace={detail.data} {...(span ? { selectedSpanId: span } : {})} onSelectSpan={id => navigate(hrefFor(state.values, { trace, span: id }), { replace: true })} />}
  </div>;

  return <OtelTraceSearch
    value={values} sources={sources} allowRecords={allowRecords} pinned={pinned}
    {...(search.data ? { result: search.data } : {})} loading={search.isFetching} {...(search.error ? { error: search.error.message } : {})}
    onChange={next => {
      const user = withoutPinned({ ...values, ...next }, pinned);
      const href = hrefFor(user);
      setState({ search: searchOf(href), values: user });
      navigate(href, { replace: true });
    }}
    onOpen={id => navigate(hrefFor(state.values, { trace: id }))} href={id => hrefFor(state.values, { trace: id })}
    onCancel={() => void client.cancelQueries({ queryKey: [SEARCH_KEY, baseUrl] })} onRetry={() => void search.refetch()}
  />;
}
