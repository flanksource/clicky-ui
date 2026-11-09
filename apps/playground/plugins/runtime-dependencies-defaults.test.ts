// @vitest-environment node
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, expect, it } from "vitest";
import { productionMiddleware } from "./production-middleware";
import { readDependencyDefaults, registerDependencyDefaults } from "./runtime-dependencies-defaults";
import { updateDependencyDocument } from "../src/browser-mode/dependency-defaults";

const cleanup: (() => void | Promise<void>)[] = [];
afterEach(async () => { for (const action of cleanup.splice(0).reverse()) await action(); });
async function fixture() {
  mkdirSync(".tmp", { recursive: true });
  const root = mkdtempSync(resolve(".tmp/dependency-defaults-")); cleanup.push(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(resolve(root, "package.json"), '{"name":"example","dependencies":{"keep":"^1"}}\n');
  const app = productionMiddleware(); registerDependencyDefaults({ ...app, root, workspaceRoot: root });
  await new Promise<void>(done => app.server.listen(0, "127.0.0.1", done));
  cleanup.push(() => new Promise<void>((done, reject) => app.server.close(error => error ? reject(error) : done())));
  const address = app.server.address(); if (!address || typeof address === "string") throw new Error("Missing test server address");
  return { root, url: `http://127.0.0.1:${address.port}/__playground/runtime-dependencies` };
}

it.each(["workspace", "profile"] as const)("previews and writes %s defaults with a stale-write guard", async scope => {
  const { root, url } = await fixture();
  const opened = await (await fetch(`${url}?scope=${scope}`)).json();
  const source = updateDependencyDocument({ source: opened.source, scope, name: "entities", version: "^7" });
  const write = () => fetch(`${url}?scope=${scope}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source, expectedHash: opened.hash }) });
  expect((await write()).status).toBe(200);
  expect(readDependencyDefaults({ root, workspaceRoot: root })[scope]).toEqual({ entities: "^7" });
  expect((await write()).status).toBe(409);
  expect(JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")).dependencies).toEqual({ keep: "^1" });
});

it("reads each layer's policy and the package-manager names that strict allows", async () => {
  const { root } = await fixture();
  writeFileSync(resolve(root, "package.json"), JSON.stringify({ dependencies: { keep: "^1" }, peerDependencies: { react: "^18" }, pageRuntime: { policy: { dependencies: "ask" }, dependencies: { yaml: "^2" } } }));
  mkdirSync(resolve(root, ".playground")); writeFileSync(resolve(root, ".playground/runtime-profile.json"), '{"policy":{"dependencies":"any"},"dependencies":{"zod":"^3"}}');
  expect(readDependencyDefaults({ root: resolve(root, "apps/playground"), workspaceRoot: root })).toEqual({ profile: { zod: "^3" }, workspace: { yaml: "^2" }, policies: { profile: "any", workspace: "ask" }, packageNames: ["keep", "react"] });
});

it("rejects unknown scopes, malformed defaults, and symlink destinations", async () => {
  const { root, url } = await fixture();
  expect((await fetch(`${url}?scope=other`)).status).toBe(400);
  const opened = await (await fetch(`${url}?scope=workspace`)).json();
  const invalid = await fetch(`${url}?scope=workspace`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source: '{"pageRuntime":{"dependencies":{"entities":"file:../entities"}}}', expectedHash: opened.hash }) });
  expect(invalid.status).toBe(400);
  mkdirSync(resolve(root, ".playground")); symlinkSync(resolve(root, "package.json"), resolve(root, ".playground/runtime-profile.json"));
  expect((await fetch(`${url}?scope=profile`)).status).toBe(400);
});
