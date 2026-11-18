// @vitest-environment node
import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { expect, it } from "vitest";
import { productionMiddleware } from "./production-middleware";
import { productionAssets } from "./production-assets";
import { productionBrowserRoutes } from "./production-browser-routes";

it("serves a static shell and unchanged source on Node while rejecting Vite request paths", async () => {
  await mkdir(".tmp", { recursive: true });
  const root = await realpath(await mkdtemp(resolve(".tmp/production-node-")));
  const app = productionMiddleware();
  try {
    await mkdir(resolve(root, "dist/assets"), { recursive: true });
    await mkdir(resolve(root, "src/pages"), { recursive: true });
    const source = 'export default () => <h1>Uncompiled</h1>;';
    await writeFile(resolve(root, "src/pages/welcome.tsx"), source);
    const image = new Uint8Array([137, 80, 78, 71, 0, 255, 128]);
    await writeFile(resolve(root, "src/pages/figure.png"), image);
    await writeFile(resolve(root, "dist/index.html"), '<html><head></head><body><script type="module" src="/__playground/dist/assets/shell.js"></script></body></html>');
    await writeFile(resolve(root, "dist/assets/shell.js"), 'document.title = "Static shell";');
    app.middlewares.use(productionBrowserRoutes({ root, sourceRoots: [{ directory: resolve(root, "src/pages"), url: "/__playground/source-roots/0/" }] }));
    app.middlewares.use(await productionAssets({ root, outDir: resolve(root, "dist"), browser: true, revision: () => "test:1" }));
    await new Promise<void>(done => app.server.listen(0, "127.0.0.1", done));
    const address = app.server.address();
    if (!address || typeof address === "string") throw new Error("Fixture server has no address");
    const origin = `http://127.0.0.1:${address.port}`;
    const response = await fetch(origin);
    const html = await response.text();
    expect(response.headers.get("x-playground-server")).toBe("node");
    expect(html).toContain('__PLAYGROUND_BROWSER_MODE__=true');
    expect(html).toContain('"welcome.tsx"');
    expect(html).not.toMatch(/\/@vite|\/@fs|src="\/src\//);
    expect(await (await fetch(`${origin}/__playground/source-roots/0/welcome.tsx?source`)).text()).toBe(source);
    const picture = await fetch(`${origin}/src/pages/figure.png`);
    expect({ type: picture.headers.get("content-type"), bytes: new Uint8Array(await picture.arrayBuffer()) }).toEqual({ type: "image/png", bytes: image });
    const link = await fetch(`${origin}/__playground/page-links/playground-pages/${resolve(root, "src/pages/figure.png").slice(1)}`);
    expect(new Uint8Array(await link.arrayBuffer())).toEqual(image);
    const script = await fetch(`${origin}/__playground/dist/assets/shell.js`, { headers: { "Accept-Encoding": "gzip" } });
    expect({ status: script.status, encoded: script.headers.get("content-encoding"), source: await script.text() }).toEqual({ status: 200, encoded: "gzip", source: 'document.title = "Static shell";' });
    for (const path of ["/@vite/client", "/@fs/private/source.tsx", "/src/pages/welcome.tsx"]) expect((await fetch(origin + path)).status).toBe(404);
  } finally {
    app.server.closeAllConnections();
    if (app.server.listening) await new Promise<void>((done, reject) => app.server.close(error => error ? reject(error) : done()));
    await rm(root, { recursive: true, force: true });
  }
});
