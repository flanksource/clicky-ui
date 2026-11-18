import { useLayoutEffect } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DensityProvider, ThemeProvider } from "@flanksource/clicky-ui";
import type { PageFrameProps, PageBridge } from "@flanksource/page-runtime/host";
import type { RuntimeProfile } from "@flanksource/page-runtime/schema";
import { exampleLock } from "../../../../packages/page-runtime/src/link/testing-fixtures";
import { BrowserSessionContext, createBrowserSession } from "../browser-mode/session";
import { loadBrowserProject, prepareBrowserProject } from "../browser-mode/load-project";
import type { EffectiveProfile } from "../browser-mode/runtime-profile";
import { VocabularyPreviewGenerator } from "./VocabularyPreviewGenerator";
import type { PreviewJob } from "./previews";
import { VocabularyGenerationHost, VocabularyProvider } from "./config";
import { useVocabulary } from "./context";

const frame = vi.hoisted(() => ({ props: null as PageFrameProps | null, request: vi.fn() }));
vi.mock("@flanksource/page-runtime/host", () => ({ PageFrame: (props: PageFrameProps) => {
  frame.props = props;
  useLayoutEffect(() => { props.onBridge?.({ request: frame.request } as unknown as PageBridge); return () => props.onBridge?.(null); }, []);
  return <iframe title={props.title} style={props.style} aria-hidden={props["aria-hidden"]} tabIndex={props.tabIndex} />;
} }));
vi.mock("../browser-mode/load-project", () => ({ loadBrowserProject: vi.fn(), prepareBrowserProject: vi.fn() }));
vi.mock("../browser-mode/local-overrides", () => ({ localOverrides: { restore: vi.fn(), getSnapshot: () => ({ links: [], permissions: {}, error: null }) } }));
vi.mock("../browser-mode/dependency-defaults", () => ({ readBrowserRuntime: () => ({ default: { dependencies: {} }, workspace: {}, page: {}, approvals: { workspace: [], pages: {} } }) }));

const catalog = { alias: "shapes", slug: "vocabularies/shapes", file: "shapes/index.tsx", page: "/shapes/index.tsx", instructions: "Read shapes as geometry.", previewRevision: "one" };
const images = [{ id: "shape/decision", image: "data:image/webp;base64,YQ==", width: 180, height: 90 }];
let close: ReturnType<typeof vi.fn>;
beforeEach(() => {
  vi.stubEnv("PLAYGROUND_BROWSER_MODE", "true");
  frame.props = null;
  close = vi.fn(async () => {});
  const project = { compatible: true as const, entryFile: "index.tsx", sourceHash: "one", page: "shapes/index.tsx", files: {}, manifest: { dependencies: {} }, links: [], aliases: {}, hashes: {}, pageDependencies: {}, defaults: { profile: {}, workspace: {}, policies: {}, packageNames: [] }, issues: [], requiredPackages: [], configuration: { aliases: {}, libraryImports: [], sourceRoots: [] } };
  const profile = { policy: { dependencies: "strict" } } as RuntimeProfile;
  vi.mocked(loadBrowserProject).mockResolvedValue({ project, base: profile, profile, effective: { profile, dependencies: {}, sources: {}, declared: {} as EffectiveProfile["declared"], policy: { dependencies: "strict", source: "served", pending: [] } }, local: [] });
  vi.mocked(prepareBrowserProject).mockResolvedValue({ lock: exampleLock(), publishedLock: exampleLock(), connected: { close } as unknown as Awaited<ReturnType<typeof prepareBrowserProject>>["connected"] });
  frame.request.mockResolvedValue({ message: { type: "vocabulary-previews", images } });
});
afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.clearAllMocks(); });

function mount(job: PreviewJob) {
  const session = createBrowserSession();
  const attach = vi.spyOn(session, "attach");
  const view = render(<ThemeProvider><DensityProvider><BrowserSessionContext.Provider value={session}><VocabularyPreviewGenerator job={job} /></BrowserSessionContext.Provider></DensityProvider></ThemeProvider>);
  return { ...view, attach };
}

it("captures once after frame readiness, scales the timeout and leaves the visible session alone", async () => {
  const job = { id: "capture", catalog, count: 250, resolve: vi.fn(), reject: vi.fn() };
  const view = mount(job);
  await waitFor(() => expect(frame.props).not.toBeNull());
  expect(loadBrowserProject).toHaveBeenCalledWith({ slug: catalog.slug, browser: { default: { dependencies: {} }, workspace: {}, page: {}, approvals: { workspace: [], pages: {} } }, overrides: { links: [], permissions: {}, error: null } });
  expect(frame.props).toMatchObject({ style: { position: "fixed", left: -20000, width: 1280, height: 800 }, "aria-hidden": "true", tabIndex: -1, origin: "same-origin-local" });
  expect(frame.request).not.toHaveBeenCalled();
  await act(async () => { frame.props!.onMessage!({ type: "status", state: "ready" }); frame.props!.onMessage!({ type: "status", state: "ready" }); });
  expect(frame.request).toHaveBeenCalledExactlyOnceWith({ type: "capture-vocabulary" }, { timeoutMs: 500000 });
  expect(job.resolve).toHaveBeenCalledWith(images);
  expect(job.reject).not.toHaveBeenCalled();
  expect(view.attach).not.toHaveBeenCalled();
  view.unmount();
  expect(close).toHaveBeenCalledOnce();
});

it("reports bridge capture failures", async () => {
  frame.request.mockRejectedValue(new Error("render: broken specimen"));
  const job = { id: "capture-failure", catalog, count: 1, resolve: vi.fn(), reject: vi.fn() };
  mount(job);
  await waitFor(() => expect(frame.props).not.toBeNull());
  await act(async () => { frame.props!.onMessage!({ type: "status", state: "ready" }); });
  expect(job.reject).toHaveBeenCalledWith(new Error("render: broken specimen"));
  expect(job.resolve).not.toHaveBeenCalled();
});

it("reports runtime preparation failures before mounting a frame", async () => {
  vi.mocked(loadBrowserProject).mockRejectedValue(new Error("Runtime profile: HTTP 503"));
  const job = { id: "runtime-failure", catalog, count: 1, resolve: vi.fn(), reject: vi.fn() };
  mount(job);
  await waitFor(() => expect(job.reject).toHaveBeenCalledWith(new Error("Runtime profile: HTTP 503")));
  expect(frame.props).toBeNull();
});

it("unmounts completed frames and captures again when regenerated at the same revision", async () => {
  const item = { catalog: "shapes", type: "shape", id: "shape/decision", label: "Decision", description: "A branching decision", references: ["shapes/index.tsx"] };
  vi.stubGlobal("fetch", vi.fn(async () => Response.json({ revision: "one", catalogs: [catalog], items: [item] })));
  function Consumer() {
    const state = useVocabulary();
    return <><VocabularyGenerationHost /><button onClick={() => void state.previews.regenerate("shapes")}>Regenerate</button>{state.vocabulary?.renderPreview(item)}</>;
  }
  render(<ThemeProvider><DensityProvider><VocabularyProvider><Consumer /></VocabularyProvider></DensityProvider></ThemeProvider>);
  await waitFor(() => expect(screen.getByTitle("Generate shapes previews")).toBeTruthy());
  await act(async () => { frame.props!.onMessage!({ type: "status", state: "ready" }); });
  await screen.findByRole("img", { name: "Decision" });
  expect(screen.queryByTitle("Generate shapes previews")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Regenerate" }));
  await screen.findByTitle("Generate shapes previews");
  await act(async () => { frame.props!.onMessage!({ type: "status", state: "ready" }); });
  await screen.findByRole("img", { name: "Decision" });
  expect(frame.request).toHaveBeenCalledTimes(2);
  expect(screen.queryByTitle("Generate shapes previews")).toBeNull();
});
