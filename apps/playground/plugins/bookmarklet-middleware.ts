import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { MiddlewareApp, Middleware } from "./middleware";
import { BOOKMARKLET_ROUTE, EXTERNAL_PAGES_ROUTE, externalUrl } from "../src/bookmarklet/model";
import { readJsonBody, sendJson } from "./comments-server";
import { associateExternalPage, readExternalPages } from "./external-pages-store";

export function registerBookmarkletMiddleware(options: {
  middlewares: MiddlewareApp;
  dir: string;
  script: () => string;
  bundleError?: () => string | undefined;
}): void {
  const middleware: Middleware = (req, res, next) => {
    const url = new URL(req.url ?? "/", "http://playground.local");
    if (url.pathname === BOOKMARKLET_ROUTE) {
      const code = options.script();
      if (!code)
        return sendJson(res, 503, {
          error: options.bundleError?.() ?? "Bookmarklet bundle is not ready",
        });
      res.setHeader("Content-Type", "text/javascript; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.end(code);
      return;
    }
    if (url.pathname === `${EXTERNAL_PAGES_ROUTE}/html`) {
      if (req.method !== "GET")
        return sendJson(res, 405, { error: "Expected GET" });
      try {
        const page = readExternalPages(options.dir).find(
          (entry) => entry.id === url.searchParams.get("page"),
        );
        const source = url.searchParams.get("url");
        if (!page || !source || !page.urls.includes(source))
          return sendJson(res, 404, {
            error: "Registered external page not found",
          });
        const file = new URL(source);
        if (file.protocol !== "file:" || !/\.html?$/i.test(file.pathname))
          return sendJson(res, 400, {
            error: "Expected a registered local HTML file",
          });
        const html = readFileSync(fileURLToPath(file), "utf8");
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Content-Security-Policy", "sandbox allow-scripts");
        res.end(html);
      } catch (error) {
        sendJson(res, 400, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
      return;
    }
    if (url.pathname !== EXTERNAL_PAGES_ROUTE) return next();
    void (async () => {
      try {
        if (req.method === "GET") {
          const pages = readExternalPages(options.dir);
          const input = url.searchParams.get("url");
          if (input === null) return sendJson(res, 200, { pages });
          const target = externalUrl(input);
          return sendJson(res, 200, {
            page: pages.find((page) => page.urls.includes(target.url)) ?? null,
            candidates: pages.filter((page) => page.base === target.base),
          });
        }
        if (req.method === "POST") {
          return sendJson(res, 200, {
            page: associateExternalPage(options.dir, await readJsonBody(req)),
          });
        }
        sendJson(res, 405, { error: "Expected GET or POST" });
      } catch (error) {
        sendJson(res, 400, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    })();
  };
  options.middlewares.use(middleware);
}

