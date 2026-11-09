import { afterEach, expect, it, vi } from "vitest";
import type { RuntimeProfile } from "@flanksource/page-runtime/schema";
import { exampleLink } from "../../../../packages/page-runtime/src/link/testing-fixtures";
import { loadBrowserProject } from "./load-project";
import type { BrowserProject } from "./project";
import type { BrowserRuntime } from "./dependency-defaults";

const profile: RuntimeProfile = { runtimeDomain: "runtime.example", embedders: ["https://host.example"], packageOrigin: "https://runtime.example/packages", registry: "https://runtime.example/packages", managed: { "@flanksource/clicky-ui": "^1" }, policy: { dependencies: "strict" }, minReleaseAgeDays: 0, network: { allow: [] }, csp: { add: {} }, links: "allow", sources: ["host"], readinessTimeoutMs: 15000 };
const project: BrowserProject = { compatible: true, entryFile: "shapes/index.tsx", sourceHash: "one", page: "shapes/index.tsx", files: {}, manifest: { dependencies: {} }, links: [], aliases: {}, hashes: {}, pageDependencies: { "page-only": "^4", shared: "^4" }, defaults: { profile: { shared: "^1", "profile-only": "^1" }, workspace: { shared: "^2", "workspace-only": "^2" }, policies: {}, packageNames: ["page-only"] }, issues: [], requiredPackages: [], configuration: { aliases: {}, libraryImports: [], sourceRoots: [] } };
const browser = (workspace: Record<string, string> = {}): BrowserRuntime => ({ default: { dependencies: {} }, workspace, page: {}, approvals: { workspace: [], pages: {} } });
afterEach(() => vi.unstubAllGlobals());

it("loads the slug with layered dependencies, requests browser-declared packages, and reports what strict rejects", async () => {
  const fetch = vi.fn(async (url: string) => Response.json(url === "/profile.json" ? profile : structuredClone(project)));
  vi.stubGlobal("fetch", fetch);
  const loaded = await loadBrowserProject({ slug: "vocabularies/shapes", browser: browser({ shared: "^3", "browser-only": "^3" }), overrides: { links: [], permissions: {}, error: null } });
  expect(loaded.project.manifest.dependencies).toEqual({ shared: "^4", "profile-only": "^1", "workspace-only": "^2", "browser-only": "^3", "page-only": "^4" });
  expect({ policy: loaded.profile.policy, pending: loaded.effective.policy.pending }).toEqual({
    policy: { dependencies: "strict", allow: ["page-only", "shared", "workspace-only"] },
    pending: [{ name: "profile-only", scope: "profile" }, { name: "browser-only", scope: "browser-workspace" }],
  });
  expect(fetch.mock.calls.map(([url]) => url)).toEqual(["/profile.json", "/__playground/browser-project?slug=vocabularies%2Fshapes&package=shared&package=browser-only"]);
});

it("fails explicitly when the runtime profile is unavailable", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response("Unavailable", { status: 503 })));
  await expect(loadBrowserProject({ slug: "vocabularies/shapes", browser: browser(), overrides: { links: [], permissions: {}, error: null } })).rejects.toThrow("Runtime profile: HTTP 503");
});

it("refuses to prepare an override whose read permission is not granted", async () => {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => Response.json(url === "/profile.json" ? profile : structuredClone(project))));
  const link = exampleLink();
  await expect(loadBrowserProject({ slug: "vocabularies/shapes", browser: browser(), overrides: { links: [link], permissions: { [link.id]: "denied" }, error: null } })).rejects.toThrow("@flanksource/clicky-ui: folder read permission is denied");
});
