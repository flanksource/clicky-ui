import { watch } from "node:fs";
import { randomUUID } from "node:crypto";
import type { ServerResponse } from "node:http";
import type { Middleware } from "./middleware";
import type { PackageCatalog } from "@flanksource/page-runtime/publication";

export function productionChanges(options: { roots: string[]; changed: (file: string) => void; packages: { current(): PackageCatalog; subscribe(listener: (catalog: PackageCatalog) => void): () => void } }) {
  const instance = randomUUID();
  let generation = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const clients = new Set<ServerResponse>();
  const revision = () => `${instance}:${generation}`;
  const send = (client: ServerResponse) => client.write(`data: ${JSON.stringify(revision())}\n\n`);
  const sendPackages = (client: ServerResponse, catalog: PackageCatalog) => client.write(`event: packages\ndata: ${JSON.stringify(catalog)}\n\n`);
  const unsubscribe = options.packages.subscribe(catalog => clients.forEach(client => sendPackages(client, catalog)));
  const changed = (file: string) => {
    options.changed(file);
    clearTimeout(timer);
    timer = setTimeout(() => { generation++; clients.forEach(send); }, 200);
  };
  const watchers = options.roots.map(root => watch(root, { recursive: true }, (_event, file) => { if (file) changed(`${root}/${file}`); }));
  const middleware: Middleware = (request, response, next) => {
    if (request.url !== "/__playground/changes") { next(); return; }
    response.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
    clients.add(response); send(response); sendPackages(response, options.packages.current());
    response.once("close", () => clients.delete(response));
  };
  const heartbeat = setInterval(() => clients.forEach(client => client.write(": keepalive\n\n")), 15000);
  return { revision, changed, middleware, close() { unsubscribe(); clearTimeout(timer); clearInterval(heartbeat); watchers.forEach(watcher => watcher.close()); clients.forEach(client => client.end()); } };
}
