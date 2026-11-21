import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { StrictMode, type PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SearchValues } from "./api";
import { searchExample, traceExample } from "./fixtures";
import { OtelTraceBrowser } from "./OtelTraceBrowser";
import story from "./OtelTraceBrowser.stories";

// The presentational parts are covered by their own tests; these stand-ins expose
// exactly what the container hands them and the callbacks it expects back.
vi.mock("./OtelTraceSearch", () => ({
  OtelTraceSearch: (props: { value: SearchValues; result?: { traces: { traceId: string }[] }; error?: string; loading: boolean; pinned?: SearchValues; allowRecords?: boolean; onChange: (next: Partial<SearchValues>) => void; onOpen: (id: string) => void; href: (id: string) => string; onRetry: () => void }) => (
    <div>
      <output data-testid="value">{JSON.stringify(props.value)}</output>
      <output data-testid="pinned">{JSON.stringify(props.pinned ?? null)}</output>
      <output data-testid="allow-records">{String(props.allowRecords)}</output>
      <output data-testid="loading">{String(props.loading)}</output>
      {props.error && <p role="alert">{props.error}</p>}
      {props.result?.traces.map(trace => <a key={trace.traceId} href={props.href(trace.traceId)} onClick={event => { event.preventDefault(); props.onOpen(trace.traceId); }}>open {trace.traceId}</a>)}
      <button onClick={() => props.onChange({ attributes: {} })}>clear attributes</button>
      <button onClick={() => props.onChange({ limit: 25 })}>limit 25</button>
      <button onClick={() => props.onChange({ offset: 100 })}>next page</button>
      <button onClick={props.onRetry}>retry</button>
    </div>
  ),
}));
vi.mock("./OtelTraceDetail", () => ({
  OtelTraceDetail: (props: { trace: { summary: { traceId: string } }; selectedSpanId?: string; onSelectSpan: (id: string) => void }) => (
    <div>
      <output data-testid="detail">{props.trace.summary.traceId}</output>
      <output data-testid="selected">{props.selectedSpanId ?? ""}</output>
      <button onClick={() => props.onSelectSpan("model")}>select model</button>
    </div>
  ),
}));

const base = "/api/v1/telemetry/traces";
const sources = [{ id: "lab", name: "Lab", type: "opensearch" }];
const traceId = traceExample.summary.traceId;
const defaults = { lookback: "1h", minSpans: 2, limit: 100 };
const planPin = { attributes: { "oipa.plan.guid=P1": "include" as const } };

type Reply = { status?: number; body: unknown };
let fetchMock: ReturnType<typeof vi.fn>;

function reply({ status = 200, body }: Reply): Response {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), { status });
}

function serve(search: () => Reply = () => ({ body: searchExample }), detail: () => Reply = () => ({ body: traceExample })) {
  fetchMock = vi.fn(async (url: string) => reply(new URL(url, "http://localhost").pathname === base ? search() : detail()));
  vi.stubGlobal("fetch", fetchMock);
}

const requested = () => fetchMock.mock.calls.map(([url]) => new URL(url as string, "http://localhost"));
const lastSearch = () => requested().filter(url => url.pathname === base).at(-1)!;

function mount(props: Partial<React.ComponentProps<typeof OtelTraceBrowser>> = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { gcTime: 0 } } });
  const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return render(<OtelTraceBrowser baseUrl={base} sources={sources} defaults={defaults} {...props} />, { wrapper });
}

const shownValue = () => JSON.parse(screen.getByTestId("value").textContent!) as SearchValues;

beforeEach(() => {
  window.history.replaceState(null, "", "/plan/p1/telemetry");
  serve();
});
afterEach(() => vi.unstubAllGlobals());

it("keeps the story mock active until the last canvas unmounts, then restores fetch", async () => {
  const realFetch = window.fetch;
  const Story = story.render;
  const first = render(<StrictMode><Story {...story.args} /></StrictMode>);
  const second = render(<Story {...story.args} />);
  await within(first.container).findByRole("link", { name: `open ${traceId}` });
  await within(second.container).findByRole("link", { name: `open ${traceId}` });
  expect(fetchMock).not.toHaveBeenCalled();

  first.unmount();
  expect(await (await window.fetch(story.args.baseUrl)).json()).toMatchObject({ total: 2 });
  second.unmount();
  expect(window.fetch).toBe(realFetch);
});

describe("searching", () => {
  it("requests the defaults on the single source and lists the traces", async () => {
    mount();
    await screen.findByText(`open ${traceId}`);
    expect(Object.fromEntries(lastSearch().searchParams)).toEqual({ lookback: "1h", minSpans: "2", limit: "100", source: "lab" });
    expect(screen.getByTestId("allow-records").textContent).toBe("false");
  });

  it("lets the URL's search values replace the defaults", async () => {
    window.history.replaceState(null, "", "/plan/p1/telemetry?lookback=6h&limit=10");
    mount();
    await screen.findByText(`open ${traceId}`);
    expect(Object.fromEntries(lastSearch().searchParams)).toEqual({ lookback: "6h", minSpans: "2", limit: "10", source: "lab" });
  });

  it("refuses to render with no source to search", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => mount({ sources: [] })).toThrow(/at least one source/);
  });

  it.each([
    ["source", "other"],
    ["run", "next-run"],
    ["index", "next-index"],
    ["format", "flat"],
    ["baseUrl", "/api/other/traces"],
  ])("keeps pending page rows in the same scope and removes them when %s changes", async (key, replacement) => {
    const view = mount();
    const link = await screen.findByRole("link", { name: `open ${traceId}` });
    fetchMock.mockImplementation(() => new Promise<Response>(() => {}));

    fireEvent.click(screen.getByText("next page"));
    await waitFor(() => expect(lastSearch().searchParams.get("offset")).toBe("100"));
    expect(link).toBeInTheDocument();

    if (key === "baseUrl") {
      view.rerender(<OtelTraceBrowser baseUrl={replacement} sources={sources} defaults={defaults} />);
      await waitFor(() => expect(requested().at(-1)?.pathname).toBe(replacement));
    } else {
      act(() => {
        const query = new URLSearchParams(window.location.search);
        query.set(key, replacement);
        window.history.pushState(null, "", `?${query}`);
        window.dispatchEvent(new PopStateEvent("popstate"));
      });
      await waitFor(() => expect(lastSearch().searchParams.get(key)).toBe(replacement));
    }
    expect(link).not.toBeInTheDocument();
  });
});

describe("pinned values", () => {
  it("sends the pinned filters with every search and tells the search form they are locked", async () => {
    mount({ pinned: planPin });
    await screen.findByText(`open ${traceId}`);
    expect(JSON.parse(lastSearch().searchParams.get("attributes")!)).toEqual(planPin.attributes);
    expect(JSON.parse(screen.getByTestId("pinned").textContent!)).toEqual(planPin);
  });

  it("keeps a pinned filter when the form clears its attributes, and keeps it out of the URL", async () => {
    mount({ pinned: planPin });
    await screen.findByText(`open ${traceId}`);
    fireEvent.click(screen.getByText("clear attributes"));
    await waitFor(() => expect(shownValue().attributes).toEqual(planPin.attributes));
    expect(JSON.parse(lastSearch().searchParams.get("attributes")!)).toEqual(planPin.attributes);
    expect(window.location.search).not.toContain("attributes");
  });

  it("keeps the user's own attribute beside the pinned one", async () => {
    window.history.replaceState(null, "", `/plan/p1/telemetry?attributes=${encodeURIComponent('{"db.system=postgresql":"include"}')}`);
    mount({ pinned: planPin });
    await screen.findByText(`open ${traceId}`);
    expect(shownValue().attributes).toEqual({ "db.system=postgresql": "include", ...planPin.attributes });
  });
});

describe("the URL", () => {
  it.each([false, true])("keeps cleared default attributes cleared on reload (pinned: %s)", async withPin => {
    const attributes = { "db.system=postgresql": "include" } as const;
    const pins = withPin ? planPin : {};
    const expected = withPin ? JSON.stringify(planPin.attributes) : null;
    const props = { defaults: { ...defaults, attributes }, pinned: pins };
    const first = mount(props);
    await screen.findByText(`open ${traceId}`);
    expect(JSON.parse(lastSearch().searchParams.get("attributes")!)).toMatchObject(attributes);

    fireEvent.click(screen.getByText("clear attributes"));
    await waitFor(() => expect(lastSearch().searchParams.get("attributes")).toBe(expected));
    expect(new URLSearchParams(window.location.search).get("attributes")).toBe("{}");
    first.unmount();

    mount(props);
    await screen.findByText(`open ${traceId}`);
    expect(lastSearch().searchParams.get("attributes")).toBe(expected);
    expect(shownValue().attributes).toEqual(withPin ? planPin.attributes : {});
  });

  it("keeps the path and the host's own query keys when the search changes, replacing history", async () => {
    window.history.replaceState(null, "", "/plan/p1/telemetry?env=lab&lookback=6h");
    const entries = window.history.length;
    mount();
    await screen.findByText(`open ${traceId}`);
    fireEvent.click(screen.getByText("limit 25"));
    await waitFor(() => expect(window.location.search).toContain("limit=25"));
    expect(window.location.pathname).toBe("/plan/p1/telemetry");
    expect(new URLSearchParams(window.location.search).get("env")).toBe("lab");
    expect(new URLSearchParams(window.location.search).get("lookback")).toBe("6h");
    expect(window.history.length).toBe(entries);
  });

  it("opens a trace, shows its detail and goes back to the search with the host's keys intact", async () => {
    window.history.replaceState(null, "", "/plan/p1/telemetry?env=lab");
    mount();
    fireEvent.click(await screen.findByText(`open ${traceId}`));
    expect((await screen.findByTestId("detail")).textContent).toBe(traceId);
    const detail = requested().find(url => url.pathname === `${base}/${traceId}`)!;
    expect(detail).toBeDefined();
    expect(new URLSearchParams(window.location.search).get("trace")).toBe(traceId);
    expect(new URLSearchParams(window.location.search).get("env")).toBe("lab");

    fireEvent.click(screen.getByRole("link", { name: "Back to trace search" }));
    await screen.findByText(`open ${traceId}`);
    expect(screen.queryByTestId("detail")).toBeNull();
    expect(new URLSearchParams(window.location.search).has("trace")).toBe(false);
    expect(new URLSearchParams(window.location.search).get("env")).toBe("lab");
    expect(window.location.pathname).toBe("/plan/p1/telemetry");
  });

  it("selects a span in the URL without adding a history entry", async () => {
    mount();
    fireEvent.click(await screen.findByText(`open ${traceId}`));
    await screen.findByTestId("detail");
    const entries = window.history.length;
    fireEvent.click(screen.getByText("select model"));
    await waitFor(() => expect(screen.getByTestId("selected").textContent).toBe("model"));
    expect(new URLSearchParams(window.location.search).get("span")).toBe("model");
    expect(window.history.length).toBe(entries);
  });

  it("restores the open trace and span when the browser goes back or forward", async () => {
    mount();
    await screen.findByText(`open ${traceId}`);
    act(() => {
      window.history.pushState(null, "", `/plan/p1/telemetry?trace=${traceId}&span=items`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect((await screen.findByTestId("detail")).textContent).toBe(traceId);
    expect(screen.getByTestId("selected").textContent).toBe("items");
    act(() => {
      window.history.pushState(null, "", "/plan/p1/telemetry?limit=7");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await screen.findByText(`open ${traceId}`);
    expect(shownValue().limit).toBe(7);
  });

  it("does not put a default the user turned off back when its own navigation fires popstate", async () => {
    mount();
    await screen.findByText(`open ${traceId}`);
    fireEvent.click(screen.getByText("limit 25"));
    await waitFor(() => expect(shownValue().limit).toBe(25));
    act(() => { window.dispatchEvent(new PopStateEvent("popstate")); });
    expect(shownValue()).toMatchObject({ limit: 25, minSpans: 2, lookback: "1h" });
  });
});

describe("autoOpenSingle", () => {
  it("opens the only matching trace by replacing the search entry, and Back to search does not reopen it", async () => {
    const entries = window.history.length;
    mount({ autoOpenSingle: true });
    expect((await screen.findByTestId("detail")).textContent).toBe(traceId);
    expect(new URLSearchParams(window.location.search).get("trace")).toBe(traceId);
    expect(window.history.length).toBe(entries);

    fireEvent.click(screen.getByRole("link", { name: "Back to trace search" }));
    await screen.findByText(`open ${traceId}`);
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 100)); });
    expect(screen.queryByTestId("detail")).toBeNull();
    expect(new URLSearchParams(window.location.search).has("trace")).toBe(false);
  });

  it("leaves several matching traces on the search", async () => {
    const second = { ...searchExample.traces[0]!, traceId: "fedcba9876543210fedcba9876543210" };
    serve(() => ({ body: { ...searchExample, traces: [...searchExample.traces, second], total: 2 } }));
    mount({ autoOpenSingle: true });
    await screen.findByText(`open ${second.traceId}`);
    expect(screen.queryByTestId("detail")).toBeNull();
  });

  it("stays on the search for one trace when not asked to open it", async () => {
    mount();
    await screen.findByText(`open ${traceId}`);
    expect(screen.queryByTestId("detail")).toBeNull();
  });
});

describe("errors", () => {
  it("shows the server's message when the search fails, and retries it", async () => {
    serve(() => ({ status: 500, body: "opensearch: too many spans" }));
    mount();
    expect((await screen.findByRole("alert")).textContent).toContain("opensearch: too many spans");
    serve();
    fireEvent.click(screen.getByText("retry"));
    await screen.findByText(`open ${traceId}`);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("names the status when the server answers without a message", async () => {
    serve(() => ({ status: 502, body: "" }));
    mount();
    expect((await screen.findByRole("alert")).textContent).toMatch(/502/);
  });

  it("shows the server's message when the trace fails to load", async () => {
    window.history.replaceState(null, "", `/plan/p1/telemetry?trace=${traceId}`);
    serve(undefined, () => ({ status: 404, body: "trace not found" }));
    mount();
    expect((await screen.findByRole("alert")).textContent).toContain("trace not found");
    expect(screen.queryByTestId("detail")).toBeNull();
  });
});
