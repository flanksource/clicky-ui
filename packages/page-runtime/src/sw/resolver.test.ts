import { describe, expect, it } from "vitest";
import type { Fragment, RuntimeProfile } from "../schema.ts";
import { composeFragments, resolveSpecifier } from "./composition.ts";
import { validateProfile } from "./profile.ts";
import { chooseVersion, satisfiesVersion } from "./versions.ts";
import { allowsDependency, checkPeers, DependencyPolicyError, esmEntries, resolvePage } from "./resolver.ts";
import { guardedBarrels } from "./barrels.ts";
import { exampleLink } from "../link/testing-fixtures.ts";

export const PROFILE: RuntimeProfile = { runtimeDomain: "pages.example.com", embedders: ["https://app.example.com"], packageOrigin: "https://unpkg.com", registry: "https://registry.npmjs.org", managed: { "@flanksource/clicky-ui": "^0.3", "@flanksource/facet": "^0.1" }, policy: { dependencies: "strict" }, minReleaseAgeDays: 3, network: { allow: ["https://api.example.com/*"] }, csp: { add: {} }, links: "deny", sources: ["host"], readinessTimeoutMs: 15000 };
const fragment = (name: string, imports: Record<string, string>): Fragment => ({ fragment: 1, name, imports, scopes: { [`${name}@1.0.0/`]: imports }, integrity: {}, remaps: {}, aliases: {}, inherits: [] });


describe("version resolution", () => {
  it.each([
    ["0.3.51", "^0.3", true], ["0.4.0", "^0.3", false], ["1.4.0", "~1.3", false], ["1.3.9", "~1.3", true],
    ["2.0.0-beta.1", "*", false], ["2.0.0-beta.2", ">=2.0.0-beta.1 <2.0.0", true], ["1.9.9", "1.2 - 1.9", true], ["3.0.0", "1.x || >=3.0.0", true],
  ])("%s satisfies %s = %s", (v, r, expected) => expect(satisfiesVersion(v, r)).toBe(expected));
  it("chooses the newest eligible release rather than a too-young matching version", () => {
    expect(chooseVersion({ name: "acme", range: "^1", times: { "1.0.0": "2026-01-01", "1.1.0": "2026-01-09" }, ageDays: 3, now: Date.parse("2026-01-10") })).toBe("1.0.0");
  });
});

describe("fragment composition", () => {
  const ui = fragment("@flanksource/clicky-ui", { "@flanksource/clicky-ui": "@flanksource/clicky-ui@1.0.0/dist/index.js", react: "react@18.3.1/index.js", dep: "dep@1.0.0/index.js" });
  const facet = fragment("@flanksource/facet", { "@flanksource/facet": "@flanksource/facet@1.0.0/dist/index.js", dep: "dep@2.0.0/index.js" });
  it("keeps closures scoped and the base set at top level", () => {
    const { map } = composeFragments({ fragments: [ui, facet] });
    expect({ dep: map.imports.dep, react: map.imports.react, facet: map.imports[facet.name], uiDep: resolveSpecifier(map, "dep", "/npm/@flanksource/clicky-ui@1.0.0/dist/a.js"), facetDep: resolveSpecifier(map, "dep", "/npm/@flanksource/facet@1.0.0/dist/a.js") }).toEqual({ dep: undefined, react: "/npm/react@18.3.1/index.js", facet: "/npm/@flanksource/facet@1.0.0/dist/index.js", uiDep: "/npm/dep@1.0.0/index.js", facetDep: "/npm/dep@2.0.0/index.js" });
  });
  it("rejects a facet remapping React", () => expect(() => composeFragments({ fragments: [ui, { ...facet, imports: { ...facet.imports, react: "react@19.0.0/index.js" } }] })).toThrow(/facet.*base-set react/));
  it("rejects conflicting remaps", () => expect(() => composeFragments({ fragments: [{ ...ui, remaps: { "dep@1/a.js": "dep@1/b.js" } }, { ...facet, remaps: { "dep@1/a.js": "dep@1/c.js" } }] })).toThrow(/remaps/));
});

describe("profile validation", () => {
  it("accepts the documented profile", () => expect(validateProfile(PROFILE)).toEqual(PROFILE));
  it.each([
    { ...PROFILE, surprise: true }, { ...PROFILE, policy: { dependencies: "any", allow: [] } },
    { ...PROFILE, flavor: { default: "development", allowed: ["development"] } }, { ...PROFILE, readinessTimeoutMs: 0 },
    { ...PROFILE, network: { allow: [], unexpected: true } }, { ...PROFILE, sources: ["server"] },
  ])("rejects invalid profile %#", (profile) => expect(() => validateProfile(profile)).toThrow());
});

describe("resolvePage", () => {
  it("opens a lock without contacting the registry", async () => {
    const lock = { lock: 2 as const, packageOrigin: PROFILE.packageOrigin, page: "report.tsx", versions: {}, map: { imports: {}, scopes: {} }, integrity: {}, remaps: {}, barrels: { modules: [], barrels: {} } };
    expect(await resolvePage({ page: lock.page, profile: PROFILE, manifest: { dependencies: {} }, lock, fetch: () => { throw new Error("registry contacted"); } })).toBe(lock);
  });
  const UI = "@flanksource/clicky-ui"; const FACET = "@flanksource/facet";
  /** `nestedType`: extra is a CommonJS package whose browser build sits in a folder with its own package.json `type`, as yaml@2 ships. */
  function registryFixture(options: { facetRange?: string; additional?: boolean; incompatiblePeer?: boolean; subpathsOnly?: boolean; nestedType?: "module" | "commonjs"; noExports?: boolean } = {}) {
    const calls: string[] = [];
    const fetcher: typeof fetch = async (input) => {
      const url = String(input); calls.push(url);
      if (url.startsWith(PROFILE.registry)) {
        const name = decodeURIComponent(url.slice(PROFILE.registry.length + 1));
        const versions = name === UI ? ["0.3.0", "0.3.1"] : name === FACET ? ["0.1.0"] : ["1.0.0"];
        const nested = options.nestedType && name === "extra" ? { type: "commonjs", main: "./dist/index.js", exports: { ".": { node: "./dist/index.js", default: "./browser/index.js" }, "./package.json": "./package.json" } } : options.noExports && name === "extra" ? { exports: undefined } : {};
        return Response.json({ time: Object.fromEntries(versions.map((v) => [v, "2026-01-01"])), versions: Object.fromEntries(versions.map((version) => [version, { name, version, sideEffects: false, type: "module", exports: options.subpathsOnly && name === "extra" ? { "./feature": "./index.js" } : "./index.js", ...nested, ...(name === FACET ? { dependencies: { [UI]: options.facetRange ?? "^0.3" } } : {}), ...(name === "extra" ? { dependencies: { helper: "^1" }, peerDependencies: { react: options.incompatiblePeer ? "^19" : "^18" } } : {}) }])) });
      }
      if (options.nestedType && url.endsWith("/extra@1.0.0/?meta")) return Response.json({ files: [{ path: "/package.json", integrity: "sha384-root" }, { path: "/dist/index.js", integrity: "sha384-cjs" }, { path: "/browser/package.json", integrity: "sha384-nested" }, { path: "/browser/index.js", integrity: "sha384-esm" }] });
      if (options.nestedType && url.endsWith("/extra@1.0.0/browser/package.json")) return Response.json({ type: options.nestedType });
      if (url.endsWith("barrels.json")) return Response.json({ modules: [], barrels: {} });
      if (url.endsWith("importmap.json")) {
        const id = url.slice(PROFILE.packageOrigin.length + 1).split("/runtime/")[0]!;
        const name = id.startsWith(UI) ? UI : FACET;
        return Response.json({ ...fragment(name, { [name]: `${id}/index.js`, ...(name === UI ? { react: "@flanksource/clicky-ui@0.3.0/runtime/react@18.3.1/index.js" } : {}) }), scopes: { [`${id}/`]: {} } });
      }
      if (options.additional && url.endsWith("?meta")) return Response.json({ files: [{ path: "/index.js", integrity: "sha384-listing" }] });
      throw new Error(`unexpected registry fixture URL ${url}`);
    };
    return { calls, fetcher };
  }
  it('loads additional managed theme runtime fragments into the page lock', async () => {
    const { fetcher } = registryFixture();
    const name = 'example-theme';
    const fetchTheme: typeof fetch = async input => {
      const url = String(input);
      if (url.endsWith(`${name}@1.0.0/dist/runtime/importmap.json`)) return Response.json(fragment(name, { [`${name}/theme`]: `${name}@1.0.0/dist/theme.js` }));
      return fetcher(input);
    };
    const lock = await resolvePage({ page: 'report.tsx', profile: { ...PROFILE, managed: { ...PROFILE.managed, [name]: '^1' } }, manifest: { dependencies: {} }, fetch: fetchTheme, now: Date.parse('2026-01-10') });
    expect({ version: lock.versions[name], module: lock.map.imports[`${name}/theme`] }).toEqual({ version: '1.0.0', module: '/npm/example-theme@1.0.0/dist/theme.js' });
  });
  it("resolves unpublished local packages and subpaths without contacting their registry", async () => {
    const { fetcher, calls } = registryFixture();
    const link = exampleLink();
    link.build.library = "@acme/unpublished";
    link.build.version = "1.0.0";
    link.build.fragment = { ...fragment(link.build.library, { [link.build.library]: "@acme/unpublished@1.0.0/index.js" }), scopes: {} };
    link.build.entries = { "@acme/unpublished": "src/index.ts", "@acme/unpublished/feature": "src/Counter.tsx" };
    const lock = await resolvePage({ page: "report.tsx", profile: { ...PROFILE, links: "allow" }, manifest: { dependencies: { "@acme/unpublished": "^1" } }, links: [link], developerOverrides: true, fetch: fetcher, now: Date.parse("2026-01-10") });
    expect(lock.map.imports["@acme/unpublished/feature"]).toBe("/link/checkout/src/Counter.tsx");
    expect(lock.versions["@acme/unpublished"]).toBe("1.0.0");
    expect(calls.some(url => url.includes("unpublished"))).toBe(false);
  });

  it("resolves the local managed library before registry selection and enforces developer policy", async () => {
    const { fetcher, calls } = registryFixture();
    const link = exampleLink();
    link.build.version = "0.3.1";
    link.build.fragment = { ...fragment(UI, { [UI]: `${UI}@0.3.1/index.js`, react: "react@18.3.1/index.js" }), scopes: {} };
    const options = { page: "report.tsx", profile: { ...PROFILE, links: "allow" as const }, manifest: { dependencies: {} }, links: [link], developerOverrides: true, fetch: fetcher, now: Date.parse("2026-01-10") };
    expect((await resolvePage(options)).map.imports[UI]).toBe("/link/checkout/src/index.ts");
    expect(calls.some(url => url.startsWith(PROFILE.registry) && url.includes(encodeURIComponent(UI)))).toBe(false);
    await expect(resolvePage({ ...options, developerOverrides: false })).rejects.toThrow(/developer overrides/);
  });
  it("applies page overrides when selecting library versions", async () => {
    const { fetcher } = registryFixture();
    const lock = await resolvePage({ page: "report.tsx", profile: PROFILE, manifest: { dependencies: {}, pageRuntime: { pages: { "report.tsx": { [UI]: "0.3.0" } } } }, fetch: fetcher, now: Date.parse("2026-01-10") });
    expect(lock.versions).toEqual({ [UI]: "0.3.0", [FACET]: "0.1.0", react: "18.3.1" });
  });
  it("resolves explicit profile dependencies as defaults while allowing a page to override them", async () => {
    const { fetcher } = registryFixture({ additional: true });
    const profile = { ...PROFILE, policy: { dependencies: "strict" as const, allow: ["extra"] }, dependencies: { extra: "^1", [UI]: "0.3.0" } };
    const lock = await resolvePage({ page: "report.tsx", profile, manifest: { dependencies: { [UI]: "0.3.1" } }, fetch: fetcher, now: Date.parse("2026-01-10") });
    expect({ extra: lock.versions.extra, ui: lock.versions[UI], import: lock.map.imports.extra }).toEqual({ extra: "1.0.0", ui: "0.3.1", import: "/npm/extra@1.0.0/index.js" });
    expect(() => validateProfile({ ...profile, dependencies: { extra: "file:../extra" } })).toThrow(/range|version/i);
  });
  it("rejects a declared package the policy does not allow, naming the package and policy", async () => {
    const { fetcher } = registryFixture({ additional: true });
    const rejected = await resolvePage({ page: "report.tsx", profile: { ...PROFILE, dependencies: { extra: "^1" } }, manifest: { dependencies: {} }, fetch: fetcher, now: Date.parse("2026-01-10") }).catch((error: unknown) => error);
    expect(rejected).toBeInstanceOf(DependencyPolicyError);
    expect({ package: (rejected as DependencyPolicyError).package_, policy: (rejected as DependencyPolicyError).policy, message: (rejected as Error).message }).toEqual({ package: "extra", policy: "strict", message: "report.tsx: package extra is not allowed by dependency policy strict" });
  });
  it("names facet and the selected clicky-ui version when their ranges disagree", async () => {
    const { fetcher } = registryFixture({ facetRange: "^0.4" });
    await expect(resolvePage({ page: "report.tsx", profile: PROFILE, manifest: { dependencies: {} }, fetch: fetcher, now: Date.parse("2026-01-10") })).rejects.toThrow(/facet@0.1.0.*clicky-ui \^0.4.*rejects 0.3.1/);
  });
  it("records additional ESM file-listing digests and keeps transitive dependencies scoped", async () => {
    const { fetcher } = registryFixture({ additional: true });
    const lock = await resolvePage({ page: "report.tsx", profile: { ...PROFILE, policy: { dependencies: "strict", allow: ["extra"] } }, manifest: { dependencies: { extra: "^1" } }, fetch: fetcher, now: Date.parse("2026-01-10") });
    expect(lock.map.imports.extra).toBe("/npm/extra@1.0.0/index.js");
    expect(lock.map.imports.helper).toBeUndefined();
    expect(lock.map.scopes["/npm/extra@1.0.0/"]?.helper).toBe("/npm/helper@1.0.0/index.js");
    expect(lock.listings?.["extra@1.0.0"]).toMatch(/^sha384-/);
  });
  it("rejects additional peers that disagree with the composed React", async () => {
    const { fetcher } = registryFixture({ additional: true, incompatiblePeer: true });
    await expect(resolvePage({ page: "report.tsx", profile: { ...PROFILE, policy: { dependencies: "any" } }, manifest: { dependencies: { extra: "^1" } }, fetch: fetcher, now: Date.parse("2026-01-10") })).rejects.toThrow(/extra@1.0.0 peer react \^19.*18.3.1/);
  });
  it.each([
    { nestedType: "module" as const, expected: { import: "/npm/extra@1.0.0/browser/index.js" } },
    { nestedType: "commonjs" as const, expected: { error: "extra: ./browser/index.js is CommonJS-only; additional packages must ship ESM" } },
  ])("judges a .js entry by its nearest package.json type ($nestedType)", async ({ nestedType, expected }) => {
    const { fetcher } = registryFixture({ additional: true, nestedType });
    const result = await resolvePage({ page: "report.tsx", profile: { ...PROFILE, policy: { dependencies: "any" } }, manifest: { dependencies: { extra: "^1" } }, fetch: fetcher, now: Date.parse("2026-01-10") })
      .then(lock => ({ import: lock.map.imports.extra }), (error: Error) => ({ error: error.message }));
    expect(result).toEqual(expected);
  });
  it("maps every subpath of an additional package that declares no exports, as Node and bundlers allow", async () => {
    const { fetcher } = registryFixture({ additional: true, noExports: true });
    const lock = await resolvePage({ page: "report.tsx", profile: { ...PROFILE, policy: { dependencies: "any" } }, manifest: { dependencies: { extra: "^1" } }, fetch: fetcher, now: Date.parse("2026-01-10") });
    expect({ prefix: lock.map.imports["extra/"], file: lock.integrity["extra@1.0.0/index.js"] }).toEqual({ prefix: "/npm/extra@1.0.0/", file: "sha384-listing" });
  });
  it("resolves additional packages that export only subpaths", async () => {
    const { fetcher } = registryFixture({ additional: true, subpathsOnly: true });
    const lock = await resolvePage({ page: "report.tsx", profile: { ...PROFILE, policy: { dependencies: "any" } }, manifest: { dependencies: { extra: "^1" } }, fetch: fetcher, now: Date.parse("2026-01-10") });
    expect(lock.map.imports["extra/feature"]).toBe("/npm/extra@1.0.0/index.js");
    expect(lock.map.imports.extra).toBeUndefined();
  });
  it("uses a local transitive dependency without registry lookup and restores its published version after removal", async () => {
    const { fetcher, calls } = registryFixture({ additional: true });
    const link = exampleLink();
    link.build = { ...link.build, library: "helper", version: "2.0.0", entries: { helper: "src/index.ts" }, fragment: { ...fragment("helper", { helper: "helper@2.0.0/index.js" }), scopes: {} }, barrels: { modules: [], barrels: {} } };
    const options = { page: "report.tsx", profile: { ...PROFILE, links: "allow" as const, policy: { dependencies: "any" as const } }, manifest: { dependencies: { extra: "^1" } }, developerOverrides: true, fetch: fetcher, now: Date.parse("2026-01-10") };
    const linked = await resolvePage({ ...options, links: [link] });
    expect(linked.map.scopes["/npm/extra@1.0.0/"]?.helper).toBe("/link/checkout/src/index.ts");
    expect(calls.some(url => url === `${PROFILE.registry}/helper`)).toBe(false);
    const published = await resolvePage(options);
    expect(published.map.scopes["/npm/extra@1.0.0/"]?.helper).toBe("/npm/helper@1.0.0/index.js");
    expect(calls).toContain(`${PROFILE.registry}/helper`);
  });
});

describe("dependency policy", () => {
  it.each([
    { policy: { dependencies: "any" as const }, name: "anything", allowed: true },
    { policy: { dependencies: "strict" as const }, name: "entities", allowed: false },
    { policy: { dependencies: "strict" as const, allow: ["entities"] }, name: "entities", allowed: true },
    { policy: { dependencies: "ask" as const, allow: ["@acme/*"] }, name: "@acme/charts", allowed: true },
    { policy: { dependencies: "ask" as const, allow: ["@acme/*"] }, name: "@other/charts", allowed: false },
  ])("$policy.dependencies with allow $policy.allow allows $name: $allowed", ({ policy, name, allowed }) => expect(allowsDependency(policy, name)).toBe(allowed));
});

describe("additional package contract", () => {
  it("rejects CommonJS-only entries", () => expect(() => esmEntries({ name: "acme", version: "1.0.0", main: "index.cjs" })).toThrow(/acme@1.0.0.*CommonJS-only/));
  it("validates peer ranges against the locked base set", () => expect(() => checkPeers({ manifest: { name: "acme", version: "1.0.0", peerDependencies: { react: "^19" } }, versions: { react: "18.3.1" }, declaration: "base set" })).toThrow(/acme@1.0.0 peer react \^19.*18.3.1/));
  it("guards barrel pruning with sideEffects patterns", () => {
    const index = { modules: ["acme@1.0.0/leaf.js"], barrels: { "acme@1.0.0/index.js": { Badge: 0 }, "acme@1.0.0/register.js": { Badge: 0 } } };
    expect(guardedBarrels({ index, name: "acme", version: "1.0.0", sideEffects: ["register.js"] })).toEqual({ ...index, barrels: { "acme@1.0.0/index.js": { Badge: 0 } } });
    expect(guardedBarrels({ index, name: "acme", version: "1.0.0" }).barrels).toEqual({});
  });
});
