import { afterEach, describe, expect, it } from "vitest";
import { APPROVALS_KEY, BROWSER_PROFILE_KEY, BROWSER_WORKSPACE_KEY, approveDependencies, browserPageKey, parseProfileLayer, readBrowserRuntime, revokeApproval, saveBrowserDocument, updateDependencyDocument, updatePolicyDocument } from "./dependency-defaults";

const SLUG = "components/widths";
afterEach(() => { for (const key of [BROWSER_PROFILE_KEY, BROWSER_WORKSPACE_KEY, browserPageKey(SLUG), APPROVALS_KEY]) localStorage.removeItem(key); });

describe("dependency documents", () => {
  it("updates workspace runtime defaults without changing package-manager dependencies or unrelated fields", () => {
    const source = JSON.stringify({ name: "example", dependencies: { entities: "^6" }, pageRuntime: { pages: { "report.tsx": { entities: "^5" } } } });
    expect(JSON.parse(updateDependencyDocument({ source, scope: "workspace", name: "entities", version: "^7" }))).toEqual({ name: "example", dependencies: { entities: "^6" }, pageRuntime: { dependencies: { entities: "^7" }, pages: { "report.tsx": { entities: "^5" } } } });
  });

  it("adds to profile documents and removes from flat browser overrides, rejecting invalid ranges", () => {
    expect(JSON.parse(updateDependencyDocument({ source: '{"dependencies":{"entities":"^6"}}', scope: "profile", name: "yaml", version: "^2" }))).toEqual({ dependencies: { entities: "^6", yaml: "^2" } });
    expect(JSON.parse(updateDependencyDocument({ source: '{"entities":"^7","yaml":"^2"}', scope: "browser-workspace", name: "entities", version: null }))).toEqual({ yaml: "^2" });
    expect(JSON.parse(updateDependencyDocument({ source: '{"policy":{"dependencies":"ask"}}', scope: "browser-default", name: "zod", version: "^3" }))).toEqual({ policy: { dependencies: "ask" }, dependencies: { zod: "^3" } });
    expect(() => updateDependencyDocument({ source: "{}", scope: "profile", name: "entities", version: "file:../entities" })).toThrow(/range|version/i);
    expect(() => updateDependencyDocument({ source: '{"dependencies":null}', scope: "profile", name: "entities", version: "^7" })).toThrow(/object/);
  });

  it("sets and clears a layer's policy, keeping package.json's under pageRuntime", () => {
    const set = updatePolicyDocument({ source: '{"name":"example"}', scope: "workspace", policy: "ask" });
    expect(JSON.parse(set)).toEqual({ name: "example", pageRuntime: { policy: { dependencies: "ask" } } });
    expect(parseProfileLayer({ source: set, scope: "workspace" })).toEqual({ dependencies: {}, policy: "ask" });
    expect(JSON.parse(updatePolicyDocument({ source: '{"policy":{"dependencies":"any"},"dependencies":{"yaml":"^2"}}', scope: "profile", policy: null }))).toEqual({ dependencies: { yaml: "^2" } });
  });

  it.each([
    ['{"policy":{"dependencies":"none"}}', /expected any \| ask \| strict/],
    ['{"policy":{"dependencies":"any","allow":["x"]}}', /policy.allow: unknown key/],
  ])("rejects the invalid profile layer %s", (source, message) => expect(() => parseProfileLayer({ source, scope: "profile" })).toThrow(message));
});

describe("browser runtime layers", () => {
  it("reads the browser default, workspace and page overrides and approvals for one page", () => {
    localStorage.setItem(BROWSER_PROFILE_KEY, '{"policy":{"dependencies":"ask"},"dependencies":{"zod":"^3"}}');
    localStorage.setItem(BROWSER_WORKSPACE_KEY, '{"entities":"^7"}');
    localStorage.setItem(browserPageKey(SLUG), '{"yaml":"^2"}');
    approveDependencies({ names: ["entities"], scope: "workspace", slug: SLUG });
    approveDependencies({ names: ["yaml"], scope: "page", slug: SLUG });
    expect(readBrowserRuntime(SLUG)).toEqual({ default: { dependencies: { zod: "^3" }, policy: "ask" }, workspace: { entities: "^7" }, page: { yaml: "^2" }, approvals: { workspace: ["entities"], pages: { [SLUG]: ["yaml"] } } });
    revokeApproval({ name: "yaml", scope: "page", slug: SLUG });
    expect(readBrowserRuntime(SLUG).approvals).toEqual({ workspace: ["entities"], pages: { [SLUG]: [] } });
  });

  it("persists a previewed browser document and refuses a stale preview", () => {
    saveBrowserDocument({ key: BROWSER_WORKSPACE_KEY, source: '{"entities":"^7"}', expected: "{}" });
    expect(readBrowserRuntime(SLUG).workspace).toEqual({ entities: "^7" });
    expect(() => saveBrowserDocument({ key: BROWSER_WORKSPACE_KEY, source: "{}", expected: "{}" })).toThrow(/changed since preview/);
  });
});
