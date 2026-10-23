import { randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { join } from "node:path";
import type { Connect, Plugin } from "vite";

export const EXPORTS_ROUTE = "/__playground/exports";
const MAX_EXPORT_BYTES = 64 * 1024 * 1024;
const EXPORT_NAME = /^[A-Za-z0-9_-]+\.(svg|png|html)$/;
const CONTENT_TYPES = {
  svg: "image/svg+xml",
  png: "image/png",
  html: "text/html; charset=utf-8",
} as const;

export class ExportError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
  }
}

function exportPath(dir: string, name: string): string {
  if (!EXPORT_NAME.test(name))
    throw new ExportError(
      `export name ${JSON.stringify(name)} must match ${EXPORT_NAME}`,
      400,
    );
  return join(dir, "exports", name);
}

// storeExport replaces the named export, so a re-copied link always serves the
// latest render of that element.
export function storeExport(dir: string, name: string, body: Buffer): string {
  const file = exportPath(dir, name);
  if (body.byteLength === 0 || body.byteLength > MAX_EXPORT_BYTES)
    throw new ExportError(
      `export must be between 1 byte and ${MAX_EXPORT_BYTES} bytes`,
      400,
    );
  const temporary = `${file}.${randomUUID()}.write.tmp`;
  mkdirSync(join(dir, "exports"), { recursive: true });
  try {
    writeFileSync(temporary, body, { flag: "wx" });
    renameSync(temporary, file);
  } finally {
    if (existsSync(temporary)) unlinkSync(temporary);
  }
  return `${EXPORTS_ROUTE}/${name}`;
}

export function serveExport(
  dir: string,
  name: string,
  res: ServerResponse,
): void {
  const file = exportPath(dir, name);
  if (!existsSync(file))
    throw new ExportError(`export ${JSON.stringify(name)} not found`, 404);
  const body = readFileSync(file);
  const extension = name.split(".").at(-1) as keyof typeof CONTENT_TYPES;
  res.statusCode = 200;
  res.setHeader("Content-Type", CONTENT_TYPES[extension]);
  res.setHeader("Content-Length", body.byteLength);
  res.setHeader("Content-Disposition", `attachment; filename="${name}"`);
  res.setHeader("Cache-Control", "no-store");
  res.end(body);
}

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

function middleware(dir: string): Connect.NextHandleFunction {
  return (req, res) => {
    void (async () => {
      const name = new URL(req.url ?? "/", "http://playground.local").pathname
        .split("/")
        .filter(Boolean)
        .join("/");
      try {
        if (req.method === "GET") return serveExport(dir, name, res);
        if (req.method !== "PUT")
          throw new ExportError(
            `${req.method} ${EXPORTS_ROUTE} is not supported`,
            405,
          );
        const url = storeExport(dir, name, await readBody(req));
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ url }));
      } catch (error) {
        res.statusCode = error instanceof ExportError ? error.statusCode : 500;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(
          JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
          }),
        );
      }
    })();
  };
}

/**
 * Stores rendered review exports under `<dir>/exports` and serves each one at
 * a stable download URL, so a copied link downloads the file directly.
 */
export function playgroundExports(options: { dir: string }): Plugin {
  return {
    name: "playground-exports",
    configureServer(server) {
      server.middlewares.use(EXPORTS_ROUTE, middleware(options.dir));
    },
    configurePreviewServer(server) {
      server.middlewares.use(EXPORTS_ROUTE, middleware(options.dir));
    },
  };
}
