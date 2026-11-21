import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { SearchResult, Trace } from "./api";
import { searchExample, traceExample } from "./fixtures";
import { OtelTraceBrowser } from "./OtelTraceBrowser";

const base = "/story/api/traces";
const singleBase = `${base}-single`;
const other = { ...traceExample, summary: { ...traceExample.summary, traceId: "fedcba9876543210fedcba9876543210", operation: "GET /orders/{id}", durationMs: 40, spanCount: 2 }, spans: traceExample.spans.slice(0, 2).map(span => ({ ...span, traceId: "fedcba9876543210fedcba9876543210" })) } satisfies Trace;
const traces = [traceExample, other];

function search(only: boolean): SearchResult {
  const shown = only ? traces.slice(0, 1) : traces;
  return { ...searchExample, traces: shown.map(trace => trace.summary), total: shown.length, rootOperations: shown.map(({ summary }) => ({ operation: summary.operation, count: 1, p50Ms: summary.durationMs, p95Ms: summary.durationMs })) };
}

/** Answers the browser's trace endpoints over the fixtures and leaves every other request alone. */
function mockTraces(): () => void {
  const real = window.fetch;
  window.fetch = async (input, init) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, window.location.href);
    const endpoint = [base, singleBase].find(path => url.pathname === path || url.pathname.startsWith(`${path}/`));
    if (!endpoint) return real.call(window, input, init);
    if (url.pathname === endpoint) return Response.json(search(endpoint === singleBase));
    const found = traces.find(trace => trace.summary.traceId === decodeURIComponent(url.pathname.slice(endpoint.length + 1)));
    return found ? Response.json(found) : new Response("trace not found", { status: 404 });
  };
  return () => { window.fetch = real; };
}

let mountedCanvases = 0;
let restoreFetch: (() => void) | undefined;

function Mocked({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Storybook Docs can mount several canvases in the same window.
    restoreFetch ??= mockTraces();
    mountedCanvases += 1;
    setReady(true);
    return () => {
      mountedCanvases -= 1;
      if (mountedCanvases === 0) {
        restoreFetch?.();
        restoreFetch = undefined;
      }
    };
  }, []);

  return ready ? <QueryClientProvider client={client}>{children}</QueryClientProvider> : null;
}

const sources = [{ id: "lab", name: "Lab OpenSearch", type: "opensearch" }];
const meta = {
  title: "Data/Traces/OpenTelemetry browser", component: OtelTraceBrowser, parameters: { layout: "fullscreen" },
  args: { baseUrl: base, sources, defaults: { lookback: "1h", limit: 100 } },
  render: args => <Mocked><div className="p-4"><OtelTraceBrowser {...args} /></div></Mocked>,
} satisfies Meta<typeof OtelTraceBrowser>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Search, open a trace, pick a span, and go back: the whole state lives in the query string. */
export const Default: Story = {};
/** The page fixes one attribute filter: it is listed as selected, cannot be removed, and stays out of the URL. */
export const Pinned: Story = { args: { pinned: { attributes: { "db.system=postgresql": "include" } } } };
/** The search finds one trace, so it opens at once; Back to trace search returns to the list. */
export const AutoOpenSingle: Story = { args: { baseUrl: singleBase, autoOpenSingle: true } };
