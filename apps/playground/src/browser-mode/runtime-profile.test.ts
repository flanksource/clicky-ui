import { describe, expect, it } from "vitest";
import type { RuntimeProfile } from "@flanksource/page-runtime/schema";
import { browserScopesDisabled, dependencyChangeRejections, effectiveProfile, type ProfileLayers } from "./runtime-profile";
import type { BrowserRuntime } from "./dependency-defaults";

const BASE: RuntimeProfile = { runtimeDomain: "runtime.example", embedders: ["https://host.example"], packageOrigin: "https://runtime.example/packages", registry: "https://runtime.example/packages", managed: { "@flanksource/clicky-ui": "^1" }, policy: { dependencies: "strict" }, minReleaseAgeDays: 0, network: { allow: [] }, csp: { add: {} }, links: "allow", sources: ["host"], readinessTimeoutMs: 15000 };
const browser = (overrides: Partial<BrowserRuntime> = {}): BrowserRuntime => ({ default: { dependencies: {} }, workspace: {}, page: {}, approvals: { workspace: [], pages: {} }, ...overrides });
const layers = (overrides: { profile?: ProfileLayers["profile"]; workspace?: Partial<ProfileLayers["workspace"]> } = {}): ProfileLayers => ({ profile: overrides.profile ?? { dependencies: {} }, workspace: { dependencies: {}, packageNames: [], ...overrides.workspace } });
const page = (dependencies: Record<string, string> = {}) => ({ slug: "components/widths", dependencies });

describe("effectiveProfile", () => {
  it("merges six dependency layers with the page header highest and records which scope declared each package", () => {
    const result = effectiveProfile({ base: BASE, linked: [], page: page({ shared: "6", "page-only": "6" }),
      browser: browser({ default: { dependencies: { shared: "1", "default-only": "1" } }, workspace: { shared: "4", "browser-workspace-only": "4" }, page: { shared: "5" } }),
      layers: layers({ profile: { dependencies: { shared: "2", "profile-only": "2" } }, workspace: { dependencies: { shared: "3", "workspace-only": "3" } } }) });
    expect({ dependencies: result.dependencies, sources: result.sources }).toEqual({
      dependencies: { shared: "6", "default-only": "1", "profile-only": "2", "workspace-only": "3", "browser-workspace-only": "4", "page-only": "6" },
      sources: { shared: "page", "default-only": "browser-default", "profile-only": "profile", "workspace-only": "workspace", "browser-workspace-only": "browser-workspace", "page-only": "page" },
    });
  });

  it("takes the policy from the highest profile layer and falls back to the served profile", () => {
    expect(effectiveProfile({ base: BASE, linked: [], page: page(), browser: browser({ default: { dependencies: {}, policy: "any" } }), layers: layers({ profile: { dependencies: {}, policy: "ask" } }) }).policy).toMatchObject({ dependencies: "ask", source: "profile" });
    expect(effectiveProfile({ base: BASE, linked: [], page: page(), browser: browser({ default: { dependencies: {}, policy: "any" } }), layers: layers() }).policy).toMatchObject({ dependencies: "any", source: "browser-default" });
    expect(effectiveProfile({ base: BASE, linked: [], page: page(), browser: browser(), layers: layers() }).policy).toMatchObject({ dependencies: "strict", source: "served" });
  });

  it("allows only package.json dependencies, peers and pageRuntime declarations under strict", () => {
    const result = effectiveProfile({ base: BASE, linked: [], page: page({ yaml: "^2", zod: "^3", entities: "^7" }), browser: browser(), layers: layers({ workspace: { dependencies: { zod: "^3" }, packageNames: ["yaml"] } }) });
    expect({ allow: result.profile.policy.allow, pending: result.policy.pending }).toEqual({ allow: ["yaml", "zod"], pending: [{ name: "entities", scope: "page" }] });
  });

  it("adds this page's and the workspace's approvals under ask, but not another page's", () => {
    const approvals = { workspace: ["entities"], pages: { "components/widths": ["yaml"], other: ["zod"] } };
    const result = effectiveProfile({ base: BASE, linked: [], page: page(), browser: browser({ workspace: { entities: "^7", yaml: "^2", zod: "^3" }, approvals }), layers: layers({ profile: { dependencies: {}, policy: "ask" } }) });
    expect({ allow: result.profile.policy.allow, pending: result.policy.pending }).toEqual({ allow: ["entities", "yaml"], pending: [{ name: "zod", scope: "browser-workspace" }] });
  });

  it("never reports managed libraries or linked packages as pending", () => {
    const result = effectiveProfile({ base: BASE, linked: ["@acme/linked"], page: page({ "@flanksource/clicky-ui": "^1", "@acme/linked": "^1" }), browser: browser(), layers: layers() });
    expect(result.policy.pending).toEqual([]);
  });

  it("sends no allow list under any", () => {
    expect(effectiveProfile({ base: BASE, linked: [], page: page({ entities: "^7" }), browser: browser(), layers: layers({ workspace: { policy: "any" } }) }).profile.policy).toEqual({ dependencies: "any" });
  });
});

describe("dependencyChangeRejections", () => {
  const rejected = { entities: "^7", temml: "^0.10", yaml: "^2" };
  const pendingOf = (workspace: Record<string, string>, extra: { workspaceDeps?: Record<string, string>; packageNames?: string[] } = {}) =>
    effectiveProfile({ base: BASE, linked: [], page: page(), browser: browser({ workspace }), layers: layers({ workspace: { dependencies: extra.workspaceDeps ?? {}, packageNames: extra.packageNames ?? [] } }) }).policy.pending;

  it("passes when only other, already rejected packages stay pending", () => {
    const before = pendingOf(rejected);
    const after = pendingOf(rejected, { workspaceDeps: { zod: "^3" } });
    expect(dependencyChangeRejections({ name: "zod", before, after })).toEqual([]);
  });

  it("fails for the changed package when it is still pending after the change", () => {
    const before = pendingOf(rejected);
    const after = pendingOf({ ...rejected, zod: "^3" });
    expect(dependencyChangeRejections({ name: "zod", before, after })).toEqual([{ name: "zod", scope: "browser-workspace" }]);
  });

  it("fails for the changed package even when it was already pending before", () => {
    const before = pendingOf(rejected);
    expect(dependencyChangeRejections({ name: "yaml", before, after: before })).toEqual([{ name: "yaml", scope: "browser-workspace" }]);
  });

  it("fails for a new pending entry the change introduced in another package", () => {
    const before = pendingOf({ entities: "^7" });
    const after = pendingOf({ entities: "^7", yaml: "^2" });
    expect(dependencyChangeRejections({ name: "zod", before, after })).toEqual([{ name: "yaml", scope: "browser-workspace" }]);
  });

  it("passes when removing a rejected browser override leaves the other rejections in place", () => {
    const before = pendingOf(rejected);
    const { yaml: _removed, ...rest } = rejected;
    const after = pendingOf(rest);
    expect(dependencyChangeRejections({ name: "yaml", before, after })).toEqual([]);
  });

  it("fails when removing a package whose lower-layer declaration is still rejected", () => {
    const base = effectiveProfile({ base: BASE, linked: [], page: page(), browser: browser({ default: { dependencies: { yaml: "^2" } }, workspace: { yaml: "^2" } }), layers: layers() }).policy.pending;
    const after = effectiveProfile({ base: BASE, linked: [], page: page(), browser: browser({ default: { dependencies: { yaml: "^2" } } }), layers: layers() }).policy.pending;
    expect(dependencyChangeRejections({ name: "yaml", before: base, after })).toEqual([{ name: "yaml", scope: "browser-default" }]);
  });
});

describe("browserScopesDisabled", () => {
  it("blocks browser scopes only when adding under strict", () => {
    expect([
      browserScopesDisabled({ policy: "strict", remove: false }), browserScopesDisabled({ policy: "strict", remove: true }),
      browserScopesDisabled({ policy: "ask", remove: false }), browserScopesDisabled({ policy: "any", remove: false }),
    ]).toEqual([true, false, false, false]);
  });
});
