import { createServer, type Server } from "node:http";
import type { Middleware, MiddlewareApp } from "./middleware";

export function productionMiddleware(): { middlewares: MiddlewareApp; server: Server } {
  const routes: { route: string; handler: Middleware }[] = [];
  const middlewares: MiddlewareApp = {
    use(route: string | Middleware, handler?: Middleware) {
      if (typeof route === "string") {
        if (!handler) throw new Error(`Missing middleware for ${route}`);
        routes.push({ route, handler });
      } else routes.push({ route: "", handler: route });
      return this;
    },
  };
  const server = createServer((request, response) => {
    response.setHeader("X-Playground-Server", "node");
    let index = 0;
    const next = (error?: unknown): void => {
      if (error) { response.writeHead(500, { "Content-Type": "application/json" }).end(JSON.stringify({ error: String(error) })); return; }
      const entry = routes[index++];
      if (!entry) { response.writeHead(404).end("Not found"); return; }
      const url = request.url ?? "/";
      const path = url.split("?")[0]!;
      if (entry.route && path !== entry.route && !path.startsWith(entry.route + "/")) { next(); return; }
      request.url = url.slice(entry.route.length) || "/";
      if (request.url.startsWith("?")) request.url = "/" + request.url;
      try { entry.handler(request, response, cause => { request.url = url; next(cause); }); }
      catch (cause) { next(cause); }
    };
    next();
  });
  return { middlewares, server };
}
