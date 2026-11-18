import { readFile, realpath } from "node:fs/promises";
import { isAbsolute, resolve, sep } from "node:path";
import type { Middleware } from "./middleware";

const ROUTE = "/__playground/oipa-conditions/";
const SERVED = /\.(yaml|tsx)$/;

/**
 * Serves the `?oipa-conditions` page's files from an OIPA env's products folder (`PLAYGROUND_OIPA_PRODUCTS_DIR`), which
 * lives outside the repo: `<dir>/group-life.yaml`, `<dir>/schemas/*.schema.yaml` and the schema extensions beside them.
 * Read only, `.yaml` and `.tsx` only, and never outside the folder.
 */
export function oipaConditionsFiles(options: { dir: string | undefined }): Middleware {
  const { dir } = options;
  if (dir !== undefined && !isAbsolute(dir)) throw new Error(`PLAYGROUND_OIPA_PRODUCTS_DIR must be an absolute path, got "${dir}"`);
  return (request, response, next) => {
    const url = new URL(request.url ?? "/", "http://playground.local");
    if (!url.pathname.startsWith(ROUTE)) { next(); return; }
    const reply = (status: number, type: string, body: string) => { response.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" }).end(body); };
    void (async () => {
      if (request.method !== "GET") return reply(405, "text/plain", "GET required");
      if (!dir) return reply(503, "text/plain", "Set PLAYGROUND_OIPA_PRODUCTS_DIR (apps/playground/.env.local) to the env's products folder, then restart the playground");
      const path = decodeURIComponent(url.pathname.slice(ROUTE.length));
      if (!SERVED.test(path) || path.split("/").some((part) => !part || part === "." || part === "..")) return reply(400, "text/plain", `${path} is not a .yaml or .tsx file path inside ${dir}`);
      const root = await realpath(dir);
      const file = await realpath(resolve(root, path));
      if (!file.startsWith(root + sep)) return reply(400, "text/plain", `${path} escapes ${dir}`);
      reply(200, "text/plain; charset=utf-8", await readFile(file, "utf8"));
    })().catch((cause: unknown) => reply((cause as NodeJS.ErrnoException).code === "ENOENT" ? 404 : 500, "text/plain", cause instanceof Error ? cause.message : String(cause)));
  };
}
