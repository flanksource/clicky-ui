import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DependencyPolicy, RuntimeProfile } from "@flanksource/page-runtime/schema";
import type { BrowserProject } from "./project";
import type { RuntimeProblem } from "./problems";
import type { DependencyScope } from "./dependency-defaults";
import { DependencyFix } from "./DependencyFix";

vi.mock("../editor/page-api", () => ({
  readPagesFile: vi.fn(async () => ({ source: "export default function Page() { return null; }\n", file: "pages/widths.tsx", hash: "page-hash" })),
  writePagesFile: vi.fn(),
}));

const BASE: RuntimeProfile = { runtimeDomain: "runtime.example", embedders: ["https://host.example"], packageOrigin: "https://runtime.example/packages", registry: "https://runtime.example/packages", managed: {}, policy: { dependencies: "strict" }, minReleaseAgeDays: 0, network: { allow: [] }, csp: { add: {} }, links: "allow", sources: ["host"], readinessTimeoutMs: 15000 };
const PROJECT = { entryFile: "pages/widths.tsx" } as BrowserProject;
const PROBLEM = (pkg: string | null): RuntimeProblem => ({ id: "p", message: "m", kind: "policy", package: pkg, locations: [], fix: "" });
const profilePolicy = (policy: DependencyPolicy | null) => ({ scope: "profile", file: ".playground/runtime-profile.json", source: "{}", hash: "profile-hash", dependencies: {}, ...(policy ? { policy } : {}) });

let fetchMock: ReturnType<typeof vi.fn>;
let policyForTest: DependencyPolicy | null = null;
beforeEach(() => {
  localStorage.clear();
  fetchMock = vi.fn(async (url: string) => {
    const document = url.endsWith("scope=workspace") ? { scope: "workspace", file: "package.json", source: "{}", hash: "workspace-hash", dependencies: {}, packageNames: [] } : profilePolicy(policyForTest);
    return new Response(JSON.stringify(document), { status: 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

async function mount(options: { policy: DependencyPolicy | null; remove: boolean; initialScope: DependencyScope }) {
  policyForTest = options.policy;
  render(<DependencyFix project={PROJECT} problem={PROBLEM(options.remove ? "yaml" : null)} base={BASE} links={[]} slug="components/widths" sourceDirty={false} initialScope={options.initialScope} remove={options.remove} onApplied={() => undefined} onClose={() => undefined} />);
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  await act(async () => { await Promise.resolve(); });
}
const scopeSelect = () => document.getElementById("runtime-dependency-scope") as HTMLSelectElement;
const optionState = () => Object.fromEntries([...scopeSelect().options].map(option => [option.value, option.disabled]));

describe("DependencyFix scope options", () => {
  it("disables browser scopes with a note and falls back to package.json when adding under strict", async () => {
    await mount({ policy: null, remove: false, initialScope: "browser-workspace" });
    expect({ options: optionState(), selected: scopeSelect().value, note: screen.getByRole("note").textContent }).toEqual({
      options: { page: false, "browser-page": true, "browser-workspace": true, workspace: false, profile: false, "browser-default": true },
      selected: "workspace",
      note: expect.stringContaining("only allows package.json declarations (pageRuntime.dependencies)"),
    });
  });

  it("keeps every scope selectable when removing under strict", async () => {
    await mount({ policy: null, remove: true, initialScope: "browser-workspace" });
    expect({ options: Object.values(optionState()).every(disabled => !disabled), selected: scopeSelect().value, notes: screen.queryAllByRole("note").length }).toEqual({ options: true, selected: "browser-workspace", notes: 0 });
  });

  it("keeps browser scopes selectable when adding under ask", async () => {
    await mount({ policy: "ask", remove: false, initialScope: "browser-workspace" });
    expect({ options: Object.values(optionState()).every(disabled => !disabled), selected: scopeSelect().value, notes: screen.queryAllByRole("note").length }).toEqual({ options: true, selected: "browser-workspace", notes: 0 });
  });
});
