import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { conversionFixture, CONVERTER, MANIFESTS, PROFILE, registryResponse } from "../../spikes/esm-sh/fixtures.ts";
import { resolvePage } from "./resolver.ts";
import { validateProfile } from "./profile.ts";
import { validateLock } from "../host/validation.ts";

const request = { page: "report.tsx", profile: PROFILE, manifest: { dependencies: { "react-copy-to-clipboard": "^5" } }, now: Date.parse("2026-01-10") };

describe("converted additional packages", () => {
  it("pins every recorded converted file and listing and scopes transitive packages without remapping React", async () => {
    const fixture = await conversionFixture();
    const lock = await resolvePage({ ...request, fetch: fixture.fetcher });
    expect(lock.map.imports["react-copy-to-clipboard"]).toBe("/esm/react-copy-to-clipboard@5.1.1/__entry.mjs");
    expect(lock.map.imports.react).toBe("/npm/react@18.3.1/index.js");
    expect(lock.map.imports["copy-to-clipboard"]).toBeUndefined();
    expect(lock.map.scopes["/esm/react-copy-to-clipboard@5.1.1/"]?.["copy-to-clipboard"]).toBe("/esm/copy-to-clipboard@3.3.3/__entry.mjs");
    expect(lock.map.scopes["/esm/copy-to-clipboard@3.3.3/"]?.["toggle-selection"]).toBe("/esm/toggle-selection@1.0.6/__entry.mjs");
    const expectedHashes: Record<string, string> = {};
    for (const [path, source] of fixture.modules) {
      const key = `esm/${path.slice(2).replace("?dev&target=es2022", "/__entry.mjs")}`;
      expectedHashes[key] = `sha384-${createHash("sha384").update(source).digest("base64")}`;
      expect(lock.integrity[key]).toBe(expectedHashes[key]);
    }
    expect(Object.keys(lock.integrity).filter((key) => key.startsWith("esm/"))).toHaveLength(6);
    expect(Object.keys(lock.listings ?? {})).toEqual(["esm/react-copy-to-clipboard@5.1.1", "esm/copy-to-clipboard@3.3.3", "esm/toggle-selection@1.0.6"]);
    for (const root of ["esm/react-copy-to-clipboard@5.1.1", "esm/copy-to-clipboard@3.3.3", "esm/toggle-selection@1.0.6"]) {
      const listing = Object.entries(expectedHashes).filter(([path]) => path.startsWith(`${root}/`)).sort(([a], [b]) => a.localeCompare(b));
      expect(lock.listings?.[root]).toBe(`sha384-${createHash("sha384").update(JSON.stringify(listing)).digest("base64")}`);
    }
    expect(() => validateLock(lock)).not.toThrow();
    const reopen = await resolvePage({ ...request, lock, fetch: () => { throw new Error("locked page fetched metadata"); } });
    expect(reopen).toBe(lock);
  });

  it("keeps the CommonJS-only error unchanged without a converter", async () => {
    const fixture = await conversionFixture();
    await expect(resolvePage({ ...request, profile: { ...Object.fromEntries(Object.entries(PROFILE).filter(([key]) => key !== "convert")) as typeof PROFILE, policy: { dependencies: "any" } }, fetch: fixture.fetcher })).rejects.toThrow("react-copy-to-clipboard@5.1.1 is CommonJS-only; additional packages must ship ESM");
    expect(fixture.calls.some((url) => url.startsWith(CONVERTER))).toBe(false);
  });

  it("checks converted peers before requesting converter output", async () => {
    const fixture = await conversionFixture({ manifests: { ...MANIFESTS, "react-copy-to-clipboard": { ...MANIFESTS["react-copy-to-clipboard"]!, peerDependencies: { react: "^19" } } } });
    await expect(resolvePage({ ...request, fetch: fixture.fetcher })).rejects.toThrow(/react-copy-to-clipboard@5.1.1 peer react \^19.*18.3.1/);
    expect(fixture.calls.some((url) => url.startsWith(CONVERTER))).toBe(false);
  });

  it("still enforces the dependency policy allowlist", async () => {
    const fixture = await conversionFixture();
    await expect(resolvePage({ ...request, profile: { ...PROFILE, policy: { dependencies: "strict", allow: ["date-fns"] } }, fetch: fixture.fetcher })).rejects.toThrow(/react-copy-to-clipboard is not allowed by dependency policy strict/);
  });

  it("keeps ESM dependencies on the package origin when a converter is configured", async () => {
    const manifests = { ...MANIFESTS, "copy-to-clipboard": { ...MANIFESTS["copy-to-clipboard"]!, type: "module", main: "index.js" } };
    const fixture = await conversionFixture({ manifests });
    const fetcher: typeof fetch = async (input, init) => {
      if (String(input) === `${PROFILE.packageOrigin}/copy-to-clipboard@3.3.3/?meta`) return Response.json({ files: [{ path: "/index.js", integrity: "sha384-native-esm" }] });
      return fixture.fetcher(input, init);
    };
    const lock = await resolvePage({ ...request, fetch: fetcher });
    expect(lock.map.scopes["/esm/react-copy-to-clipboard@5.1.1/"]?.["copy-to-clipboard"]).toBe("/npm/copy-to-clipboard@3.3.3/index.js");
    expect(lock.map.scopes["/npm/copy-to-clipboard@3.3.3/"]?.["toggle-selection"]).toBe("/esm/toggle-selection@1.0.6/__entry.mjs");
    expect(lock.listings?.["copy-to-clipboard@3.3.3"]).toMatch(/^sha384-/);
    expect(fixture.calls.some((url) => url.startsWith(`${CONVERTER}/*copy-to-clipboard`))).toBe(false);
  });

  it("checks transitive converted peers against the managed React", async () => {
    const fixture = await conversionFixture({ manifests: { ...MANIFESTS, "copy-to-clipboard": { ...MANIFESTS["copy-to-clipboard"]!, peerDependencies: { react: "^19" } } } });
    await expect(resolvePage({ ...request, fetch: fixture.fetcher })).rejects.toThrow(/copy-to-clipboard@3.3.3 peer react \^19.*18.3.1/);
  });

  it("requires base-set dependencies to use compatible existing mappings", async () => {
    const fixture = await conversionFixture({ manifests: { ...MANIFESTS, "copy-to-clipboard": { ...MANIFESTS["copy-to-clipboard"]!, dependencies: { scheduler: "^0.23" } } } });
    await expect(resolvePage({ ...request, fetch: fixture.fetcher })).rejects.toThrow(/copy-to-clipboard@3.3.3.*unmapped base-set dependency scheduler/);
  });

  it("uses the existing package cycle guard across converted dependencies", async () => {
    const fixture = await conversionFixture({ manifests: { ...MANIFESTS, "toggle-selection": { ...MANIFESTS["toggle-selection"]!, dependencies: { "react-copy-to-clipboard": "^5" } } } });
    const lock = await resolvePage({ ...request, fetch: fixture.fetcher });
    expect(lock.map.scopes["/esm/toggle-selection@1.0.6/"]?.["react-copy-to-clipboard"]).toBe("/esm/react-copy-to-clipboard@5.1.1/__entry.mjs");
    expect(fixture.calls.filter((url) => url === `${CONVERTER}/*react-copy-to-clipboard@5.1.1?dev&target=es2022`)).toHaveLength(1);
  });

  it("retains minimum release age for converted package versions", async () => {
    const fixture = await conversionFixture();
    const fetcher: typeof fetch = async (input, init) => {
      if (String(input) === `${PROFILE.registry}/react-copy-to-clipboard`) {
        const response = await registryResponse("react-copy-to-clipboard").json() as { time: Record<string, string> };
        response.time["5.1.1"] = "2026-01-09T00:00:00Z";
        return Response.json(response);
      }
      return fixture.fetcher(input, init);
    };
    await expect(resolvePage({ ...request, fetch: fetcher })).rejects.toThrow(/react-copy-to-clipboard.*minimum release age 3 days/);
  });

  it("does not convert malformed export declarations", async () => {
    const fixture = await conversionFixture({ manifests: { ...MANIFESTS, "react-copy-to-clipboard": { ...MANIFESTS["react-copy-to-clipboard"]!, exports: ["./index.js"] } } });
    await expect(resolvePage({ ...request, fetch: fixture.fetcher })).rejects.toThrow(/export arrays are not supported/);
    expect(fixture.calls.some((url) => url.startsWith(CONVERTER))).toBe(false);
  });

  it.each(["/node/process.mjs", "/*other@1.0.0/es2022/other.mjs", "https://foreign.example/module.mjs"])("rejects converter import %s with its package version", async (specifier) => {
    const fixture = await conversionFixture();
    fixture.modules.set("/*react-copy-to-clipboard@5.1.1?dev&target=es2022", `import ${JSON.stringify(specifier)};`);
    await expect(resolvePage({ ...request, fetch: fixture.fetcher })).rejects.toThrow(/react-copy-to-clipboard@5.1.1/);
  });

  it("crawls literal dynamic imports and terminates internal cycles", async () => {
    const fixture = await conversionFixture();
    const root = "/*react-copy-to-clipboard@5.1.1";
    fixture.modules.set(`${root}?dev&target=es2022`, `export const lazy = () => import('${root}/es2022/lazy.mjs');`);
    fixture.modules.set(`${root}/es2022/lazy.mjs`, `export * from '${root}/es2022/lazy.mjs';`);
    const lock = await resolvePage({ ...request, fetch: fixture.fetcher });
    expect(lock.integrity["esm/react-copy-to-clipboard@5.1.1/es2022/lazy.mjs"]).toMatch(/^sha384-/);
    expect(fixture.calls.filter((url) => url === `${CONVERTER}${root}/es2022/lazy.mjs`)).toHaveLength(1);
  });
});

describe("converter profile validation", () => {
  it.each(["any", "ask", "strict"] as const)("accepts a converter under dependency policy %s", (dependencies) => {
    const profile = { ...PROFILE, policy: { dependencies }, convert: { origin: CONVERTER } };
    expect(validateProfile(profile)).toEqual(profile);
  });
  it.each(["https://user:password@converter.example", "ftp://converter.example", "https://converter.example/?token=x"])("rejects invalid converter origin %s", (origin) => {
    expect(() => validateProfile({ ...PROFILE, convert: { origin } })).toThrow();
  });
  it("rejects unknown converter keys", () => expect(() => validateProfile({ ...PROFILE, convert: { origin: CONVERTER, bundle: true } })).toThrow(/unknown key/));
});
