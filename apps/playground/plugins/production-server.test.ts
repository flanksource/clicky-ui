import {
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import { resolve } from "node:path";
import { createServer, type ViteDevServer } from "vite";
import { expect, it, vi } from "vitest";
import { playgroundMarkdown } from "./markdown-vite-plugin";
import { playgroundProduction } from "./production-server";

it("serves a compiled shell with shared React, live page discovery and reloads", async () => {
  await mkdir(".tmp", { recursive: true });
  const root = await realpath(
    await mkdtemp(resolve(".tmp/production-server-")),
  );
  let server: ViteDevServer | undefined;
  try {
    await mkdir(resolve(root, "src/pages"), { recursive: true });
    await mkdir(resolve(root, "vendor"));
    await symlink(
      resolve("node_modules"),
      resolve(root, "node_modules"),
      "dir",
    );
    await Promise.all([
      writeFile(
        resolve(root, "vendor/render.ts"),
        'export { renderToStaticMarkup } from "react-dom/server";',
      ),
      writeFile(
        resolve(root, "index.html"),
        '<html><head></head><body><script type="module" src="/src/main.tsx"></script></body></html>',
      ),
      writeFile(
        resolve(root, "src/main.tsx"),
        'import "./styles.css"; import { PAGES } from "./registry"; import { token } from "./shared"; document.title = String(PAGES) + token;',
      ),
      writeFile(
        resolve(root, "src/shared.ts"),
        'import { createContext } from "react"; export const token = createContext("compiled-provider");',
      ),
      writeFile(resolve(root, "src/styles.css"), "body { color: red; }"),
      writeFile(
        resolve(root, "src/registry.ts"),
        `
        export const PAGES = import.meta.glob(["./pages/**/*.tsx"]);
        export const guidance = import.meta.glob(["./pages/**/*.tsx"], {query:"?playground-markdown"});
        export const meta = import.meta.glob(["./pages/**/*.tsx"], {query:"?playground-meta"});
        export const markdown = import.meta.glob(["./pages/**/*.md"], {query:"?raw"});
      `,
      ),
      writeFile(
        resolve(root, "src/pages/welcome.tsx"),
        'import { useState } from "react"; import { token } from "../shared"; export { useState, token }; export default function Page() { return null; }',
      ),
      writeFile(
        resolve(root, "src/pages/broken.tsx"),
        'import Missing from "./does-not-exist"; export default Missing;',
      ),
    ]);
    server = await createServer({
      configFile: false,
      root,
      logLevel: "silent",
      plugins: [
        playgroundProduction({ root }),
        playgroundMarkdown({ sourceRoot: resolve(root, "src") }),
      ],
      server: { host: "127.0.0.1", port: 0 },
    });
    await server.listen();
    const origin = server.resolvedUrls?.local[0];
    if (!origin) throw new Error("Production fixture server has no URL");
    const html = await (await fetch(origin)).text();
    expect(html).toContain('"welcome.tsx"');
    expect(html).toContain('"broken.tsx"');
    expect(html).not.toContain('src="/src/main.tsx"');
    expect(html).toContain('rel="stylesheet"');
    const asset = html.match(
      /src="(\/__playground\/dist\/assets\/index-[^"]+\.js)"/,
    )?.[1];
    if (!asset) throw new Error("Compiled shell entry missing");
    const shell = await fetch(new URL(asset, origin), {
      headers: { "Accept-Encoding": "gzip" },
    });
    expect(shell.status).toBe(200);
    expect(shell.headers.get("content-encoding")).toBe("gzip");
    expect(shell.headers.get("cache-control")).toContain("immutable");
    const compiled = await readFile(
      resolve(root, "dist", asset.slice("/__playground/dist/".length)),
      "utf8",
    );
    expect(compiled).toContain("__PLAYGROUND_FILES__");
    const before = await stat(resolve(root, "dist/index.html"));
    const page = await (
      await fetch(new URL("src/pages/welcome.tsx", origin))
    ).text();
    expect(page).toContain("playground-compiled:");
    expect(page).not.toContain('from "/src/shared.ts"');
    expect(page).not.toContain("/deps/react");
    const renderer = await (
      await fetch(new URL("vendor/render.ts", origin))
    ).text();
    expect(renderer).toContain("playground-compiled:");
    const guidance = await fetch(
      new URL("src/pages/welcome.tsx?playground-markdown", origin),
    );
    expect(guidance.status, await guidance.text()).toBe(200);
    const send = vi.spyOn(server.ws, "send");
    await writeFile(
      resolve(root, "src/pages/new.tsx"),
      "export default function Page() { return null; }",
    );
    server.watcher.emit("add", resolve(root, "src/pages/new.tsx"));
    await vi.waitFor(async () => {
      const updated = await (await fetch(origin)).text();
      expect(updated.match(/__PLAYGROUND_REVISION__=([^<]+)/)?.[1]).not.toEqual(html.match(/__PLAYGROUND_REVISION__=([^<]+)/)?.[1]);
    });
    expect(send).not.toHaveBeenCalledWith({ type: "full-reload", path: "*" });
    expect(html).not.toContain('/@vite/client');
    expect(await (await fetch(origin)).text()).toContain('"new.tsx"');
    expect((await stat(resolve(root, "dist/index.html"))).mtimeMs).toBe(
      before.mtimeMs,
    );
  } finally {
    await server?.close();
    await rm(root, { recursive: true, force: true });
  }
}, 30_000);
