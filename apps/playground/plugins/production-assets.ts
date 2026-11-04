import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { promisify } from "node:util";
import { gzip } from "node:zlib";
import type { Connect } from "vite";
import { pageFiles } from "./production-registry";

const compress = promisify(gzip);
export const PRODUCTION_ASSET_BASE = "/__playground/dist/";

function acceptsGzip(value = ""): boolean {
  return value.split(",").some((coding) => {
    const [name, ...params] = coding.trim().split(";");
    return (
      name === "gzip" &&
      params.every(
        (param) =>
          !param.trim().startsWith("q=") || Number(param.trim().slice(2)) > 0,
      )
    );
  });
}

export async function productionAssets({
  root,
  outDir,
  revision,
}: {
  root: string;
  outDir: string;
  revision?: () => string;
}): Promise<Connect.NextHandleFunction> {
  const html = await readFile(resolve(outDir, "index.html"), "utf8");
  const files = new Map<
    string,
    Promise<{ content: Buffer; compressed: Buffer }>
  >();
  return (request, response, next) => {
    const url = new URL(request.url ?? "/", "http://playground.local");
    if (url.pathname.startsWith(PRODUCTION_ASSET_BASE)) {
      const file = resolve(
        outDir,
        decodeURIComponent(url.pathname.slice(PRODUCTION_ASSET_BASE.length)),
      );
      if (!file.startsWith(outDir + "/")) {
        response.writeHead(403).end();
        return;
      }
      let pending = files.get(file);
      if (!pending) {
        pending = readFile(file).then(async (content) => ({
          content,
          compressed: await compress(content),
        }));
        files.set(file, pending);
      }
      void pending
        .then(({ content, compressed }) => {
          const encoded = acceptsGzip(request.headers["accept-encoding"]);
          const body = encoded ? compressed : content;
          const contentType = {
            ".js": "text/javascript",
            ".css": "text/css",
            ".svg": "image/svg+xml",
            ".woff2": "font/woff2",
            ".json": "application/json",
          }[extname(file)];
          response.setHeader(
            "Content-Type",
            contentType ?? "application/octet-stream",
          );
          response.setHeader(
            "Cache-Control",
            url.pathname.startsWith(PRODUCTION_ASSET_BASE + "assets/")
              ? "public, max-age=31536000, immutable"
              : "no-cache",
          );
          response.setHeader("Vary", "Accept-Encoding");
          response.setHeader("Content-Length", body.length);
          if (encoded) response.setHeader("Content-Encoding", "gzip");
          response.end(body);
        })
        .catch((error: NodeJS.ErrnoException) => {
          if (error.code === "ENOENT") response.writeHead(404).end();
          else next(error);
        });
      return;
    }
    if (url.pathname !== "/" && url.pathname !== "/index.html") {
      next();
      return;
    }
    void pageFiles(root)
      .then((pages) => {
        const manifest = JSON.stringify(pages).replaceAll("<", "\\u003c");
        const live = `<script>globalThis.__PLAYGROUND_FILES__=${manifest};globalThis.__PLAYGROUND_REVISION__=${JSON.stringify(revision?.() ?? null)}</script><script type="module" src="/src/styles.css"></script>`;
        response.setHeader("Content-Type", "text/html");
        response.setHeader("Cache-Control", "no-store");
        response.end(html.replace("<head>", "<head>" + live));
      })
      .catch(next);
  };
}
