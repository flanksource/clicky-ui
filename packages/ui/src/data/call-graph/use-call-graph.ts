import { useEffect, useRef, useState } from "react";
import type { CallGraph, CallGraphEdge, CallGraphFetchParams, CallGraphSite, SiteGuardsState } from "./types";

/**
 * A value the host may control: with `onChange` the host holds it and `value` is the truth; without
 * one the component holds it, starting from `value`.
 */
export function useHeld<T>(value: T, onChange: ((next: T) => void) | undefined): [T, (next: T) => void] {
  const [own, setOwn] = useState(value);
  return onChange ? [value, onChange] : [own, setOwn];
}

/** The latest value, for an effect or callback that must not re-run when it changes. */
function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function aborted(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export type GraphRequest = Omit<CallGraphFetchParams, "signal">;

interface LoadState<G> {
  /** The key the held data was loaded for: it stays on screen while the next key loads. */
  dataKey?: string;
  data?: G;
  error?: { key: string; message: string };
  loadingKey?: string;
}

/** The graph on screen, without the state of any request. */
function held<G>({ dataKey, data }: LoadState<G>): LoadState<G> {
  return dataKey === undefined || data === undefined ? {} : { dataKey, data };
}

/**
 * Loads the graph for `request`, keyed by `key`. A new key aborts the request before it; the last
 * graph stays in `data` until the next arrives, so the diagram does not blank while it loads.
 */
export function useGraphLoad<G extends CallGraph>(
  fetchGraph: (params: CallGraphFetchParams) => Promise<G>,
  request: GraphRequest | undefined,
  key: string,
) {
  const fetchRef = useLatest(fetchGraph);
  const requestRef = useLatest(request);
  const [state, setState] = useState<LoadState<G>>({});
  useEffect(() => {
    const current = requestRef.current;
    if (!current) return;
    const controller = new AbortController();
    setState((previous) => ({ ...held(previous), loadingKey: key }));
    fetchRef.current({ ...current, signal: controller.signal }).then(
      (data) => setState({ dataKey: key, data }),
      (error: unknown) => {
        if (controller.signal.aborted || aborted(error)) return;
        setState((previous) => ({ ...held(previous), error: { key, message: errorMessage(error) } }));
      },
    );
    return () => controller.abort();
  }, [key]);
  return {
    data: state.data,
    fresh: state.dataKey === key ? state.data : undefined,
    error: state.error?.key === key ? state.error.message : undefined,
    loading: request !== undefined && state.loadingKey === key,
  };
}

/**
 * The guards of the selected edge's sites, fetched on selection and kept per held graph, for a host
 * whose graph responses leave guards out. Undefined when there is no loader or no edge.
 */
export function useSiteGuards<G extends CallGraph>(
  load: ((edge: CallGraphEdge, graph: G, signal: AbortSignal) => Promise<CallGraphSite[]>) | undefined,
  scope: string | undefined,
  edge: CallGraphEdge | undefined,
  graph: G | undefined,
): SiteGuardsState | undefined {
  const loadRef = useLatest(load);
  const graphRef = useLatest(graph);
  const edgeRef = useLatest(edge);
  const [held, setHeld] = useState<Record<string, SiteGuardsState>>({});
  const cacheKey = load && edge && scope !== undefined ? `${scope}\u0000${edge.id}` : undefined;
  const entry = cacheKey === undefined ? undefined : held[cacheKey];
  useEffect(() => {
    const loader = loadRef.current;
    const target = edgeRef.current;
    const drawn = graphRef.current;
    if (cacheKey === undefined || entry !== undefined || !loader || !target || !drawn) return;
    const controller = new AbortController();
    const settle = (next: SiteGuardsState) => setHeld((current) => ({ ...current, [cacheKey]: next }));
    const label = (id: string) => drawn.nodes.find((node) => node.id === id)?.label ?? id;
    settle({ status: "loading" });
    loader(target, drawn, controller.signal).then(
      (sites) => settle({ status: "loaded", sites }),
      (error: unknown) => {
        if (controller.signal.aborted || aborted(error)) return;
        settle({ status: "failed", error: `Cannot load the guards of ${label(target.from)} → ${label(target.to)}: ${errorMessage(error)}` });
      },
    );
    return () => {
      controller.abort();
      // An abandoned load is forgotten, so selecting the edge again asks again.
      setHeld((current) => {
        if (current[cacheKey]?.status !== "loading") return current;
        const rest = { ...current };
        delete rest[cacheKey];
        return rest;
      });
    };
  }, [cacheKey]);
  return entry;
}
