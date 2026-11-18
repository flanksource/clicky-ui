import { readFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { WORKSPACE_VERSIONS } from "./helpers";

test("runtime scripts revalidate by content without disabling the browser's script cache", async ({ request }) => {
  const script = await request.get("http://localhost:5811/boot.js");
  expect(script.ok()).toBe(true);
  expect(script.headers()["cache-control"]).toBe("no-cache");
  const etag = script.headers().etag;
  expect(etag).toMatch(/^"[a-f0-9]{64}"$/);
  const revalidated = await request.get("http://localhost:5811/boot.js", { headers: { "if-none-match": etag! } });
  expect(revalidated.status()).toBe(304);
  expect(await revalidated.body()).toHaveLength(0);
});

for (const library of [
  { name: "@flanksource/clicky-ui", directory: new URL("../../../packages/ui/", import.meta.url), entry: "dist/index.js" },
  { name: "@flanksource/facet", directory: new URL("../../../../facet/", import.meta.url), entry: "dist/components/index.js" },
]) {
  test(`local origin serves ${library.name}'s real metadata and built artifacts`, async ({ request }) => {
    const response = await request.get("http://localhost:5811/profile.json");
    expect(response.ok()).toBe(true);
    const profile = await response.json() as { registry: string; packageOrigin: string; minReleaseAgeDays: number };
    expect(profile.registry).toBe(profile.packageOrigin);
    expect(new URL(profile.registry).hostname).toBe("127.0.0.1");
    const version = WORKSPACE_VERSIONS[library.name]!;
    const metadata = await request.get(`${profile.registry}/${encodeURIComponent(library.name)}`);
    expect(metadata.ok()).toBe(true);
    expect(await metadata.json()).toEqual({ name: library.name, versions: { [version]: JSON.parse(await readFile(new URL("package.json", library.directory), "utf8")) }, time: { [version]: "2000-01-01T00:00:00.000Z" }, "dist-tags": { latest: version } });
    expect(Date.parse("2000-01-01T00:00:00.000Z")).toBeLessThan(Date.now() - profile.minReleaseAgeDays * 86_400_000);
    for (const path of ["dist/runtime/importmap.json", "dist/runtime/barrels.json", library.entry]) {
      const artifact = await request.get(`${profile.packageOrigin}/${library.name}@${version}/${path}`);
      expect(artifact.ok(), `${library.name}@${version}/${path}`).toBe(true);
      expect(artifact.headers()["access-control-allow-origin"]).toBe("*");
      expect(artifact.headers()["cache-control"]).toBe("no-store");
      expect(await artifact.body()).toEqual(await readFile(new URL(path, library.directory)));
    }
    const mismatch = await request.get(`${profile.packageOrigin}/${library.name}@0.0.0/${library.entry}`);
    expect(mismatch.status()).toBe(404);
    expect(await mismatch.text()).toContain(`${library.name}@${version}`);
  });
}
