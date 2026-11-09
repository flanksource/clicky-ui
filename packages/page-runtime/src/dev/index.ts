import { readFile, realpath } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { extname, resolve, sep } from "node:path";
import { createCatalogStore, type LocalPackage } from "./catalog.ts";

export type PackageOriginOptions = { packages: string[]; upstreamRegistry: string; upstreamOrigin: string; stateDir: string };
export type PackageHandler = (request: IncomingMessage, response: ServerResponse) => Promise<void>;
export const LOCAL_RELEASE_TIME = "2000-01-01T00:00:00.000Z";

type Served = { body: string | Uint8Array; type: string; status: number; cache: string };
const types: Record<string, string> = {
  ".js": "text/javascript", ".mjs": "text/javascript", ".cjs": "text/javascript",
  ".json": "application/json", ".map": "application/json", ".css": "text/css",
  ".html": "text/html", ".txt": "text/plain", ".md": "text/markdown",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".gif": "image/gif", ".webp": "image/webp", ".avif": "image/avif", ".ico": "image/x-icon",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".otf": "font/otf", ".wasm": "application/wasm",
};
const textResponse = (status: number, body: string): Served => ({ status, body, type: "text/plain; charset=utf-8", cache: "no-store" });

function upstreamBase(value: string): string {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error(`upstream must be an HTTP(S) URL without credentials, query or hash: ${value}`);
  return url.href.replace(/\/$/, "");
}

async function localFile(local: LocalPackage, path: string): Promise<Served> {
  if (!path || path.split(/[\\/]/).some((part) => part === "..") || path.includes("\0")) return textResponse(404, "Invalid local package file path");
  try {
    const file = await realpath(resolve(local.directory, path));
    if (!file.startsWith(`${local.directory}${sep}`)) return textResponse(404, "File is outside the local package directory");
    return { body: await readFile(file), status: 200, type: types[extname(file)] ?? "application/octet-stream", cache: "no-store" };
  } catch (error) {
    if (["ENOENT", "ENOTDIR", "EISDIR"].includes((error as NodeJS.ErrnoException).code ?? "")) return textResponse(404, `${local.manifest.name}@${local.manifest.version}: file not found: ${path}`);
    throw error;
  }
}

async function serveRequest(options: { url: string; method: string; locals: Map<string, LocalPackage>; registry: string; origin: string; immutable: boolean }): Promise<Served> {
  const { url, method, locals, registry, origin } = options;
  if (method === "OPTIONS") return textResponse(204, "");
  if (!["GET", "HEAD"].includes(method)) return textResponse(405, "Only GET, HEAD and OPTIONS are supported");
  let path: string;
  try { path = decodeURIComponent(url.split("?")[0]!); }
  catch { return textResponse(400, "Invalid URL encoding"); }
  if (path === "/") return { status: 200, body: JSON.stringify({ packages: [...locals.keys()] }), type: "application/json", cache: "no-store" };
  const match = path.match(/^\/((?:@[^/@]+\/)?[^/@]+)(?:@([^/]+)(?:\/(.*))?)?$/);
  if (!match) return textResponse(404, `Invalid package path: ${path}`);
  const [, name, version, file] = match;
  const local = locals.get(name!);
  if (local) {
    const manifest = local.manifest;
    if (!version) return { status: 200, body: JSON.stringify({ name, versions: { [manifest.version]: manifest }, time: { [manifest.version]: LOCAL_RELEASE_TIME }, "dist-tags": { latest: manifest.version } }), type: "application/json", cache: options.immutable ? "public, max-age=31536000, immutable" : "no-store" };
    if (version !== manifest.version) return textResponse(404, `Requested ${name}@${version}; local package is ${name}@${manifest.version}`);
    const served = await localFile(local, file ?? "");
    if (options.immutable && served.status === 200) served.cache = "public, max-age=31536000, immutable";
    return served;
  }
  const target = `${version ? origin : registry}${url}`;
  try {
    const response = await fetch(target, { method, signal: AbortSignal.timeout(30_000) });
    return { status: response.status, body: new Uint8Array(await response.arrayBuffer()), type: response.headers.get("content-type") ?? "application/octet-stream", cache: response.headers.get("cache-control") ?? "no-store" };
  } catch (error) {
    return textResponse(502, `Proxy ${target}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function createPackageHandler(options: PackageOriginOptions) {
  const registry = upstreamBase(options.upstreamRegistry);
  const origin = upstreamBase(options.upstreamOrigin);
  if (!options.packages.length) throw new Error("At least one local package directory is required");
  const store = await createCatalogStore(options);
  const handle: PackageHandler = async (request, response) => {
    response.setHeader("access-control-allow-origin", "*");
    response.setHeader("access-control-allow-methods", "GET, HEAD, OPTIONS");
    response.setHeader("access-control-allow-headers", "*");
    try {
      const raw = request.url ?? "/";
      const generation = raw.match(/^\/_generations\/([^/]+)(\/.*)$/);
      const selected = await store.get(generation?.[1]);
      const url = generation?.[2] ?? raw;
      const served = ["GET", "HEAD"].includes(request.method ?? "GET") && url.split("?")[0] === "/__catalog.json"
        ? { status: 200, body: JSON.stringify(selected.catalog), type: "application/json", cache: generation ? "public, max-age=31536000, immutable" : "no-store" }
        : await serveRequest({ url, method: request.method ?? "GET", locals: selected.locals, registry, origin, immutable: Boolean(generation) });
      response.writeHead(served.status, {
        "content-type": served.type,
        "cache-control": served.cache,
        ...(served.status === 204 || served.status === 304 ? {} : { "content-length": typeof served.body === "string" ? Buffer.byteLength(served.body) : served.body.byteLength }),
        "timing-allow-origin": "*",
        "access-control-expose-headers": "content-length, content-encoding, server-timing",
      });
      response.end(request.method === "HEAD" ? undefined : served.body);
    } catch (error) {
      response.writeHead((error as NodeJS.ErrnoException).code === "ENOENT" ? 404 : 500, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" });
      response.end(error instanceof Error ? error.message : String(error));
    }
  };
  return { handle, current: store.current, subscribe: store.subscribe, close: store.close };
}

export async function servePackages(options: PackageOriginOptions & { port: number }): Promise<{ origin: string; close: () => Promise<void> }> {
  if (!Number.isInteger(options.port) || options.port < 0 || options.port > 65535) throw new Error(`Invalid port: ${options.port}`);
  const handler = await createPackageHandler(options);
  const server = createServer((request, response) => { void handler.handle(request, response); });
  await new Promise<void>((done, fail) => { server.once("error", fail); server.listen(options.port, "127.0.0.1", done); });
  return {
    origin: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    close: () => new Promise<void>((done, fail) => {
      handler.close();
      server.closeAllConnections();
      server.close((error) => error ? fail(error) : done());
    }),
  };
}
