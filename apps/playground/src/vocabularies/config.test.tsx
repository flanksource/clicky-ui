import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { VocabularyGenerationHost, VocabularyProvider } from "./config";
import { useVocabulary } from "./context";
import { VocabularyStatus } from "./VocabularyStatus";
import { DensityProvider, ThemeProvider } from "@flanksource/clicky-ui";

const snapshot = { revision: "one", catalogs: [], items: [] };
const connections = [
  { name: "Gavel", url: "http://gavel.local", status: "connected", management: "external" },
  { name: "Captain", url: "http://captain.local", status: "connected", management: "external" },
];
const RESTART_ENDPOINT = "/__playground/connections/gavel/restart";
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

it("keeps the lint-count failure behind a warning status dot", async () => {
  const problemsError = "invalid launch input: local workspace access is disabled";
  vi.stubGlobal("fetch", vi.fn(async (url: string) => Response.json(url === "/__playground/connections" ? { connections } : snapshot)));
  render(<VocabularyProvider><VocabularyStatus problemsError={problemsError} /></VocabularyProvider>);
  const trigger = await screen.findByRole("button", { name: "Playground status: lint counts unavailable" });
  expect(screen.queryByText(problemsError)).toBeNull();
  fireEvent.click(trigger);
  expect({ title: screen.getByText("Lint counts unavailable").textContent, message: screen.getByText(problemsError).textContent }).toEqual({ title: "Lint counts unavailable", message: problemsError });
});

function mockBackends(gavel: Record<string, unknown>, restart: () => Response | Promise<Response>) {
  const calls: string[] = [];
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    calls.push(`${init?.method ?? "GET"} ${url}`);
    if (url === RESTART_ENDPOINT) return restart();
    return Response.json(url === "/__playground/connections" ? { connections: [{ ...connections[0], ...gavel }, connections[1]] } : snapshot);
  }));
  return calls;
}

it("restarts the Gavel server the playground started once confirmed, and shows the new process", async () => {
  const [OLD_PID, NEW_PID] = [4101, 4202];
  let respond!: () => void;
  const calls = mockBackends(
    { status: "incompatible", error: "Gavel at http://gavel.local is incompatible. Rebuild and restart Gavel.", management: "playground", pid: OLD_PID },
    () => new Promise(resolve => { respond = () => resolve(Response.json({ connections: [{ ...connections[0], management: "playground", pid: NEW_PID }, connections[1]] })); }),
  );
  render(<VocabularyProvider><Consumer /></VocabularyProvider>);
  fireEvent.click(await screen.findByRole("button", { name: "Playground status: incompatible" }));
  expect(screen.getByText(`Started by the playground · pid ${OLD_PID}`)).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Restart Captain" })).toBeNull();
  expect(screen.getByText("Run outside the playground")).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "Restart Gavel" }));
  const dialog = await screen.findByRole("dialog", { name: "Restart Gavel?" });
  expect({ menuOpen: screen.queryByRole("heading", { name: "Connections" }) !== null, mentionsPid: dialog.textContent?.includes(`pid ${OLD_PID}`), posted: calls.includes(`POST ${RESTART_ENDPOINT}`) }).toEqual({ menuOpen: false, mentionsPid: true, posted: false });
  fireEvent.click(screen.getByRole("button", { name: "Restart" }));

  await screen.findByRole("button", { name: "Playground status: restarting Gavel" });
  respond();
  fireEvent.click(await screen.findByRole("button", { name: "Playground status: ready" }));
  expect(screen.getByText(`Started by the playground · pid ${NEW_PID}`)).toBeTruthy();
  expect(calls.filter(call => call === `POST ${RESTART_ENDPOINT}`)).toHaveLength(1);
  expect(screen.getAllByText("Connected")).toHaveLength(2);
});

it("starts an on-demand Gavel without asking, and reports a failed start until connections are refreshed", async () => {
  const failure = "gavel launch serve exited (1) before http://gavel.local answered: listen tcp: bind: address already in use";
  const calls = mockBackends({ status: "disconnected", error: "Connection refused", management: "on-demand" }, () => Response.json({ error: failure }, { status: 502 }));
  render(<VocabularyProvider><Consumer /></VocabularyProvider>);
  fireEvent.click(await screen.findByRole("button", { name: "Playground status: disconnected" }));
  expect(screen.getByText("Not running · the playground starts it when needed")).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "Start Gavel" }));
  await screen.findByText("Could not start Gavel");
  expect({ dialog: screen.queryByRole("dialog", { name: /Gavel/ }), posts: calls.filter(call => call === `POST ${RESTART_ENDPOINT}`).length, message: screen.getByText(failure).textContent }).toEqual({ dialog: null, posts: 1, message: failure });
  expect((screen.getByRole("button", { name: "Start Gavel" }) as HTMLButtonElement).disabled).toBe(false);
  expect(screen.getByRole("button", { name: "Playground status: could not start Gavel" })).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "Refresh connections" }));
  await screen.findByRole("button", { name: "Playground status: disconnected" });
  expect(screen.queryByText("Could not start Gavel")).toBeNull();
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
