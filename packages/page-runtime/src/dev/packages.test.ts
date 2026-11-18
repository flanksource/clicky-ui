import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LOCAL_RELEASE_TIME, servePackages } from "./index.ts";
import { publishPackage } from "../publication/index.ts";

const manifest = { name: "@acme/ui", version: "1.2.3", type: "module", files: ["dist"], exports: { ".": "./dist/index.js" }, dependencies: { helper: "^2.0.0" } };
const files = { "dist/index.js": "export const answer = 42;", "dist/styles.css": "body { color: red; }", "dist/logo.svg": '<svg xmlns="http://www.w3.org/2000/svg"/>', "dist/font.woff2": "font bytes" };
let root: string;
let origin: string;
let requests: string[];
let close: () => Promise<void>;
let closeUpstream: () => Promise<void>;

beforeEach(async () => {
  await mkdir(resolve(".tmp/K-local-origin"), { recursive: true });
  root = await mkdtemp(resolve(".tmp/K-local-origin/package-"));
  await writeFile(resolve(root, "package.json"), JSON.stringify(manifest));
  for (const [path, contents] of Object.entries(files)) {
    await mkdir(resolve(root, path, ".."), { recursive: true });
    await writeFile(resolve(root, path), contents);
  }
  requests = [];
  await mkdir(resolve(root, ".cache"));
  await symlink(".cache", resolve(root, ".tmp"));
  await publishPackage({ libraryDir: root });
  const upstream = createServer((req, res) => {
    requests.push(req.url!);
    res.writeHead(req.url!.includes("missing") ? 404 : 200, { "content-type": "application/json", "cache-control": "public, max-age=60" });
    res.end(JSON.stringify({ path: req.url }));
  });
  await new Promise<void>((done) => upstream.listen(0, "127.0.0.1", done));
  closeUpstream = () => new Promise<void>((done, fail) => { upstream.closeAllConnections(); upstream.close((error) => error ? fail(error) : done()); });
  const upstreamUrl = `http://127.0.0.1:${(upstream.address() as AddressInfo).port}`;
  const local = await servePackages({ packages: [root], stateDir: resolve(root, ".tmp/origin"), port: 0, upstreamRegistry: `${upstreamUrl}/registry`, upstreamOrigin: `${upstreamUrl}/origin` });
  origin = local.origin;
  close = local.close;
});

afterEach(async () => {
  if (close) await close();
  if (closeUpstream) await closeUpstream();
  await rm(root, { recursive: true, force: true });
});

describe("workspace package origin", () => {
  it.each(["/@acme%2Fui", "/%40acme%2Fui", "/@acme/ui"])("serves real registry metadata at %s with an explicit old release date", async (path) => {
    const response = await fetch(`${origin}${path}`);
    expect(await response.json()).toEqual({ name: manifest.name, versions: { "1.2.3": manifest }, time: { "1.2.3": "2000-01-01T00:00:00.000Z" }, "dist-tags": { latest: "1.2.3" } });
    expect(LOCAL_RELEASE_TIME).toBe("2000-01-01T00:00:00.000Z");
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(requests).toEqual([]);
  });

  it.each([
    ["dist/index.js", "text/javascript"],
    ["dist/styles.css", "text/css"], ["dist/logo.svg", "image/svg+xml"], ["dist/font.woff2", "font/woff2"],
  ])("maps %s to unchanged local bytes with its content type", async (path, type) => {
    const response = await fetch(`${origin}/@acme/ui@1.2.3/${path}`);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain(type);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.text()).toBe(files[path as keyof typeof files]);
  });

  it("serves complete immutable generations during rebuilds and after an origin restart", async () => {
    const first = await (await fetch(`${origin}/__catalog.json`)).json();
    const pinned = `${origin}/_generations/${first.revision}`;
    await rm(resolve(root, "dist"), { recursive: true });
    expect(await (await fetch(`${pinned}/@acme/ui@1.2.3/dist/index.js`)).text()).toBe(files["dist/index.js"]);
    await mkdir(resolve(root, "dist"));
    await writeFile(resolve(root, "dist/index.js"), "export const answer = 43;");
    await writeFile(resolve(root, "package.json"), JSON.stringify({ ...manifest, description: "rebuilt" }));
    expect(await (await fetch(`${origin}/@acme/ui@1.2.3/dist/index.js`)).text()).toBe(files["dist/index.js"]);
    await publishPackage({ libraryDir: root });
    await expect.poll(async () => (await (await fetch(`${origin}/__catalog.json`)).json()).revision).not.toBe(first.revision);
    expect(await (await fetch(`${origin}/@acme/ui@1.2.3/dist/index.js`)).text()).toBe("export const answer = 43;");
    expect(await (await fetch(`${origin}/@acme/ui`)).json()).toMatchObject({ versions: { "1.2.3": { description: "rebuilt" } } });
    const restarted = await servePackages({ packages: [root], stateDir: resolve(root, ".tmp/origin"), port: 0, upstreamRegistry: origin, upstreamOrigin: origin });
    try { expect(await (await fetch(`${restarted.origin}/_generations/${first.revision}/@acme/ui@1.2.3/dist/index.js`)).text()).toBe(files["dist/index.js"]); }
    finally { await restarted.close(); }
  });

  it("rejects a different local version without contacting upstream", async () => {
    const response = await fetch(`${origin}/@acme/ui@9.0.0/dist/index.js`);
    expect(response.status).toBe(404);
    expect(await response.text()).toContain("@acme/ui@1.2.3");
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(requests).toEqual([]);
  });

  it.each(["/helper", "/@acme%2Fhelper", "/helper@2.0.0/index.js?raw", "/@acme/helper@2.0.0/?meta", "/missing@1.0.0/index.js"])("proxies %s to the corresponding upstream preserving status, bytes and query", async (path) => {
    const prefix = path.includes("@2.0.0") || path.includes("@1.0.0") ? "/origin" : "/registry";
    const response = await fetch(`${origin}${path}`);
    expect(response.status).toBe(path.includes("missing") ? 404 : 200);
    expect(await response.json()).toEqual({ path: `${prefix}${path}` });
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(response.headers.get("content-type")).toBe("application/json");
    expect(requests).toEqual([`${prefix}${path}`]);
  });

  it.each([
    ["text module", "/@acme/ui@1.2.3/dist/index.js", "GET", Buffer.byteLength(files["dist/index.js"])],
    ["binary asset", "/@acme/ui@1.2.3/dist/font.woff2", "GET", Buffer.byteLength(files["dist/font.woff2"])],
    ["proxied response", "/helper", "GET", Buffer.byteLength(JSON.stringify({ path: "/registry/helper" }))],
    ["HEAD request", "/@acme/ui@1.2.3/dist/index.js", "HEAD", Buffer.byteLength(files["dist/index.js"])],
  ])("reports the served byte count and exposes timing headers for a %s", async (_kind, path, method, bytes) => {
    const response = await fetch(`${origin}${path}`, { method });
    expect({
      length: response.headers.get("content-length"),
      timing: response.headers.get("timing-allow-origin"),
      exposed: response.headers.get("access-control-expose-headers"),
    }).toEqual({ length: String(bytes), timing: "*", exposed: "content-length, content-encoding, server-timing" });
  });

  it("rejects traversal and symlink escapes and never proxies missing local files", async () => {
    await symlink(resolve("package.json"), resolve(root, "dist/outside"));
    for (const path of ["dist/%2e%2e%2f%2e%2e%2fsecret", "dist/outside", "missing.js"]) {
      const response = await fetch(`${origin}/@acme/ui@1.2.3/${path}`);
      expect(response.status).toBe(404);
      expect(response.headers.get("access-control-allow-origin")).toBe("*");
    }
    expect(requests).toEqual([]);
  });

  it("answers preflights and HEAD, and rejects writes with CORS", async () => {
    const preflight = await fetch(origin, { method: "OPTIONS" });
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("access-control-allow-methods")).toBe("GET, HEAD, OPTIONS");
    const head = await fetch(`${origin}/@acme/ui@1.2.3/dist/index.js`, { method: "HEAD" });
    expect(head.status).toBe(200);
    expect(await head.text()).toBe("");
    const post = await fetch(origin, { method: "POST" });
    expect(post.status).toBe(405);
    expect(post.headers.get("access-control-allow-origin")).toBe("*");
  });

  it("fails startup for duplicate package names or invalid configuration", async () => {
    const options = { packages: [root, root], stateDir: resolve(root, ".tmp/origin"), port: 0, upstreamRegistry: origin, upstreamOrigin: origin };
    await expect(servePackages(options)).rejects.toThrow(/duplicate.*@acme\/ui/i);
    await expect(servePackages({ ...options, packages: [root], port: -1 })).rejects.toThrow(/port/i);
    await expect(servePackages({ ...options, packages: [root], upstreamOrigin: "file:///etc" })).rejects.toThrow(/https?/i);
  });

  it("supports an unscoped published package and ignores unpublished identity changes", async () => {
    await writeFile(resolve(root, "package.json"), JSON.stringify({ ...manifest, name: "widget" }));
    await publishPackage({ libraryDir: root });
    const local = await servePackages({ packages: [root], stateDir: resolve(root, ".tmp/widget-origin"), port: 0, upstreamRegistry: origin, upstreamOrigin: origin });
    try {
      expect(await (await fetch(`${local.origin}/widget`)).json()).toMatchObject({ name: "widget", "dist-tags": { latest: manifest.version } });
      expect(await (await fetch(`${local.origin}/widget@1.2.3/dist/index.js`)).text()).toBe(files["dist/index.js"]);
      await writeFile(resolve(root, "package.json"), JSON.stringify({ ...manifest, name: "widget", version: "2.0.0" }));
      const changed = await fetch(`${local.origin}/widget`);
      expect(changed.status).toBe(200);
      expect(await changed.json()).toMatchObject({ name: "widget", "dist-tags": { latest: "1.2.3" } });
      expect(changed.headers.get("access-control-allow-origin")).toBe("*");
    } finally { await local.close(); }
  });

  it("surfaces proxy transport failures and malformed URLs with CORS", async () => {
    const unavailable = await servePackages({ packages: [root], stateDir: resolve(root, ".tmp/origin"), port: 0, upstreamRegistry: "http://127.0.0.1:0/registry", upstreamOrigin: origin });
    try {
      const response = await fetch(`${unavailable.origin}/helper`);
      expect(response.status).toBe(502);
      expect(await response.text()).toContain("/registry/helper");
      expect(response.headers.get("access-control-allow-origin")).toBe("*");
    } finally { await unavailable.close(); }
    const malformed = await fetch(`${origin}/%zz`);
    expect(malformed.status).toBe(400);
    expect(malformed.headers.get("access-control-allow-origin")).toBe("*");
  });
});
