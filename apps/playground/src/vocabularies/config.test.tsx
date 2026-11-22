import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { VocabularyGenerationHost, VocabularyProvider } from "./config";
import { useVocabulary } from "./context";
import { VocabularyStatus } from "./VocabularyStatus";
import { DensityProvider, ThemeProvider } from "@flanksource/clicky-ui";

const snapshot = { revision: "one", catalogs: [], items: [] };
const connections = [
  { name: "Gavel", url: "http://gavel.local", status: "connected" },
  { name: "Captain", url: "http://captain.local", status: "connected" },
];
function mockVocabularyFetch(fetch: typeof globalThis.fetch) {
  vi.stubGlobal("fetch", (url: string, init?: RequestInit) => url === "/__playground/connections" ? Promise.resolve(Response.json({ connections })) : fetch(url, init));
}
function Consumer() {
  const state = useVocabulary();
  return <><input aria-label="Draft" defaultValue="Keep my draft" /><button onClick={state.retry}>Retry test</button><span>{state.error ? "Unavailable" : state.vocabulary ? "Ready" : "Loading"}</span><VocabularyStatus /></>;
}
afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it("preserves the editor and its draft through initial failure and successful retry", async () => {
  const fetch = vi.fn().mockRejectedValueOnce(new TypeError("Failed to fetch")).mockResolvedValue(new Response(JSON.stringify(snapshot), { headers: { "Content-Type": "application/json" } }));
  mockVocabularyFetch(fetch);
  render(<VocabularyProvider><Consumer /></VocabularyProvider>);
  const input = screen.getByLabelText("Draft");
  fireEvent.change(input, { target: { value: "Edited draft" } });
  await screen.findByText("Unavailable");
  expect(screen.getByLabelText("Draft")).toBe(input);
  fireEvent.click(screen.getByText("Retry test"));
  await screen.findByText("Ready");
  expect((input as HTMLInputElement).value).toBe("Edited draft");
});

it("keeps structured HTTP diagnostics behind the status dot", async () => {
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "Catalog invalid", hint: "Fix catalog" }), { status: 500, headers: { "Content-Type": "application/json" } }));
  mockVocabularyFetch(fetch);
  render(<VocabularyProvider><Consumer /></VocabularyProvider>);
  await screen.findByText("Unavailable");
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(screen.queryByText("Catalog invalid")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Playground status: unavailable" }));
  await screen.findByText("Catalog invalid");
  expect(screen.getByRole("button", { name: "Copy error details" })).toBeTruthy();
  expect(screen.getByText("More details")).toBeTruthy();
  fireEvent.click(screen.getByText("More details"));
  await screen.findByText("Fix catalog");
  expect(screen.getAllByText("/__playground/vocabularies").length).toBeGreaterThan(0);
});

it("does not overlap manual retries and ignores cancellation after unmount", async () => {
  let complete!: (response: Response) => void;
  const fetch = vi.fn(() => new Promise<Response>(resolve => { complete = resolve; }));
  mockVocabularyFetch(fetch);
  const view = render(<VocabularyProvider><Consumer /></VocabularyProvider>);
  fireEvent.click(screen.getByText("Retry test"));
  fireEvent.click(screen.getByText("Retry test"));
  expect(fetch).toHaveBeenCalledTimes(1);
  const signal = fetch.mock.calls[0] as unknown as [string, RequestInit];
  view.unmount();
  expect(signal[1].signal?.aborted).toBe(true);
  complete(new Response(JSON.stringify(snapshot), { headers: { "Content-Type": "application/json" } }));
});

it.each(["./missing-preview.tsx", "./_test/ThrowingPreview.tsx"])("contains preview failure %s and recovers on a new revision", async page => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const item = { catalog: "broken", type: "box", id: "box/header", label: "Header", description: "Example", references: ["docs/example"] };
  const data = { revision: "broken", catalogs: [{ alias: "broken", page, slug: "vocabularies/broken", file: "broken/index.tsx", instructions: "Read broken as specimens.", previewRevision: "broken" }], items: [item] };
  mockVocabularyFetch(vi.fn(async () => new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } })));
  function PreviewConsumer() { const state = useVocabulary(); return <><VocabularyGenerationHost /><p>Page stays mounted</p><VocabularyStatus />{state.vocabulary?.renderPreview(item)}</>; }
  render(<ThemeProvider><DensityProvider><VocabularyProvider><PreviewConsumer /></VocabularyProvider></DensityProvider></ThemeProvider>);
  await screen.findByText(page.includes("Throwing") ? "Specimen render failed" : /Unknown variable dynamic import|Failed to resolve|Cannot find|Unknown variable|Failed to fetch|Cannot import/);
  expect(screen.getByText("Page stays mounted")).toBeTruthy();
  await waitFor(() => expect(screen.getByRole("button", { name: "Playground status: preview issues" })).toBeTruthy());
  data.revision = "recovered";
  data.items = [];
  data.catalogs = [];
  fireEvent.focus(window);
  await screen.findByRole("button", { name: "Playground status: ready" });
  expect(screen.queryByText("Specimen render failed")).toBeNull();
});

it("renders cached preview images with dimensions and accessible labels", async () => {
  const item = { catalog: "shapes", type: "shape", id: "shape/decision", label: "Decision", description: "A branching decision", references: ["shapes/index.tsx"] };
  const catalog = { alias: "shapes", page: "./missing-page.tsx", slug: "vocabularies/shapes", file: "shapes/index.tsx", instructions: "Read shapes as geometry.", previewRevision: "cached" };
  localStorage.setItem("clicky-playground.vocabulary-previews.shapes", JSON.stringify({ previewRevision: "cached", images: { [item.id]: { image: "data:image/webp;base64,YQ==", width: 180, height: 90 } } }));
  mockVocabularyFetch(vi.fn(async () => Response.json({ revision: "cached", catalogs: [catalog], items: [item] })));
  function ImageConsumer() { const { vocabulary } = useVocabulary(); return <>{vocabulary?.renderPreview(item)}</>; }
  render(<VocabularyProvider><ImageConsumer /></VocabularyProvider>);
  const image = await screen.findByRole("img", { name: "Decision" });
  expect({ src: image.getAttribute("src"), width: image.getAttribute("width"), height: image.getAttribute("height") }).toEqual({ src: "data:image/webp;base64,YQ==", width: "180", height: "90" });
  expect(screen.queryByRole("status")).toBeNull();
});

it("preserves a loaded editor on background failure and keeps recovery inside the dropdown", async () => {
  let failing = false;
  mockVocabularyFetch(vi.fn(async () => {
    if (failing) throw new TypeError("Failed to fetch");
    return new Response(JSON.stringify(snapshot), { headers: { "Content-Type": "application/json" } });
  }));
  render(<VocabularyProvider><Consumer /></VocabularyProvider>);
  await screen.findByText("Ready");
  const input = screen.getByLabelText("Draft");
  fireEvent.change(input, { target: { value: "Unsaved work" } });
  failing = true;
  fireEvent.focus(window);
  await screen.findByText("Unavailable");
  expect(screen.queryByText("Vocabulary loading failed")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Playground status: unavailable" }));
  await screen.findByText("Vocabulary loading failed");
  failing = false;
  fireEvent.click(screen.getByRole("button", { name: "Retry vocabulary loading" }));
  await screen.findByText("Ready");
  expect(screen.getByRole("heading", { name: "Comment vocabularies" })).toBeTruthy();
  expect(screen.getByLabelText("Draft")).toBe(input);
  expect((input as HTMLInputElement).value).toBe("Unsaved work");
});

it("preserves the status and response body for a non-JSON failure", async () => {
  mockVocabularyFetch(vi.fn(async () => new Response("Service unavailable", { status: 503, headers: { "Content-Type": "text/plain" } })));
  render(<VocabularyProvider><Consumer /></VocabularyProvider>);
  await screen.findByText("Unavailable");
  fireEvent.click(screen.getByRole("button", { name: "Playground status: unavailable" }));
  await screen.findByText(/The playground API returned a non-JSON response/);
  fireEvent.click(screen.getByText("More details"));
  await screen.findByText("503");
  expect(screen.getByText("Service unavailable")).toBeTruthy();
});

it("lists each backend with its address and offers no way to start or restart it", async () => {
  const calls: string[] = [];
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    calls.push(`${init?.method ?? "GET"} ${url}`);
    return Response.json(url === "/__playground/connections" ? { connections: [{ ...connections[0], status: "incompatible", error: "Gavel at http://gavel.local is incompatible. Rebuild and restart Gavel." }, connections[1]] } : snapshot);
  }));
  render(<VocabularyProvider><Consumer /></VocabularyProvider>);
  fireEvent.click(await screen.findByRole("button", { name: "Playground status: incompatible" }));

  expect({
    addresses: ["http://gavel.local", "http://captain.local"].map(url => screen.getByText(url, { selector: "p" }).textContent),
    actions: screen.queryAllByRole("button", { name: /^(Start|Restart) / }).length,
    notes: screen.queryAllByText(/Run outside the playground|Started by the playground|Not running/).length,
    posts: calls.filter(call => call.startsWith("POST ")),
  }).toEqual({ addresses: ["http://gavel.local", "http://captain.local"], actions: 0, notes: 0, posts: [] });
  expect(screen.getByRole("button", { name: "Refresh connections" })).toBeTruthy();
});

it.each(["disconnected", "incompatible"])("shows independent backend %s state and clears the status dot after retry", async status => {
  let offline = true;
  vi.stubGlobal("fetch", vi.fn(async (url: string) => Response.json(url === "/__playground/connections" ? { connections: connections.map(connection => connection.name === "Gavel" && offline ? { ...connection, status, error: "Connection refused" } : connection) } : snapshot)));
  render(<VocabularyProvider><Consumer /></VocabularyProvider>);
  fireEvent.click(await screen.findByRole("button", { name: `Playground status: ${status}` }));
  expect(screen.getByText("Gavel")).toBeTruthy();
  expect(screen.getByText(status === "incompatible" ? "Incompatible" : "Disconnected")).toBeTruthy();
  expect(screen.getByText("Captain")).toBeTruthy();
  expect(screen.getByText("Connected")).toBeTruthy();
  expect(screen.getByText("Connection refused")).toBeTruthy();
  offline = false;
  fireEvent.click(screen.getByRole("button", { name: "Refresh connections" }));
  await screen.findByRole("button", { name: "Playground status: ready" });
  expect(screen.queryByText("Connection refused")).toBeNull();
  expect(screen.getAllByText("Connected")).toHaveLength(2);
});
