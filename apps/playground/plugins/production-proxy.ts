import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import type { Middleware } from "./middleware";

export function productionProxy(options: { prefix: string; target: string }): Middleware {
  const target = new URL(options.target);
  if (!["http:", "https:"].includes(target.protocol) || target.username || target.password || target.search || target.hash) throw new Error(`Invalid playground proxy target ${target.origin}`);
  return (request, response, next) => {
    const incoming = request.url ?? "/";
    const path = incoming.split("?")[0]!;
    if (path !== options.prefix && !path.startsWith(options.prefix + "/")) { next(); return; }
    const suffix = incoming.slice(options.prefix.length);
    const url = new URL(`${target.origin}${target.pathname.replace(/\/$/, "")}${suffix.startsWith("/") ? suffix : "/" + suffix}`);
    const upstream = (url.protocol === "https:" ? httpsRequest : httpRequest)(url, { method: request.method, headers: { ...request.headers, host: url.host } }, result => {
      response.writeHead(result.statusCode ?? 502, result.headers); result.pipe(response);
    });
    upstream.once("error", error => {
      if (response.headersSent) { response.destroy(error); return; }
      response.writeHead(502, { "Content-Type": "application/json" }).end(JSON.stringify({ error: `Proxy ${target.origin}: ${error.message}` }));
    });
    response.once("close", () => upstream.destroy());
    request.pipe(upstream);
  };
}
