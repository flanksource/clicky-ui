import { randomUUID } from "node:crypto";
import type { ServerResponse } from "node:http";
import type { ViteDevServer } from "vite";

export function productionChanges(server: ViteDevServer, root: string) {
  const instance = randomUUID();
  let generation = 0;
  const clients = new Set<ServerResponse>();
  const revision = () => `${instance}:${generation}`;
  const send = (client: ServerResponse) =>
    client.write(`data: ${JSON.stringify(revision())}\n\n`);
  let timer: ReturnType<typeof setTimeout>;
  const changed = (file: string) => {
    if (
      !file.startsWith(`${root}/src/pages/`) &&
      file !== `${root}/src/styles.css` &&
      !server.environments.client?.moduleGraph.getModulesByFile(file)?.size
    )
      return;
    const relative = file.startsWith(root + "/")
      ? file.slice(root.length)
      : file;
    if (
      relative.includes("/node_modules/") ||
      relative.includes("/dist/") ||
      relative.includes("/.tmp/")
    )
      return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      generation++;
      clients.forEach(send);
    }, 200);
  };
  server.watcher.on("add", changed).on("change", changed).on("unlink", changed);
  server.middlewares.use((request, response, next) => {
    if (request.url !== "/__playground/changes") {
      next();
      return;
    }
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    clients.add(response);
    send(response);
    response.on("close", () => clients.delete(response));
  });
  const heartbeat = setInterval(
    () => clients.forEach((client) => client.write(": keepalive\n\n")),
    15000,
  );
  const close = () => {
    clearTimeout(timer);
    clearInterval(heartbeat);
    server.watcher
      .off("add", changed)
      .off("change", changed)
      .off("unlink", changed);
    clients.forEach((client) => client.end());
  };
  server.httpServer?.once("close", close);
  return { revision, close };
}
