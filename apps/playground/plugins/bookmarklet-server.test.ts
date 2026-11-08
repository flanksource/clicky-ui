// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { afterEach, expect, it } from "vitest";
import { createServer, type ViteDevServer } from "vite";
import { playgroundBookmarklet } from "./bookmarklet-server";
import { BOOKMARKLET_ROUTE } from "../src/bookmarklet/model";

let server: ViteDevServer | undefined;
let root: string | undefined;
afterEach(async () => { await server?.close(); if (root) rmSync(root, { recursive: true, force: true }); });

it("keeps development bookmarklet bundling and plain API mounting working", async () => {
  mkdirSync(".tmp", { recursive: true });
  root = mkdtempSync(resolve(".tmp/bookmarklet-server-"));
  mkdirSync(join(root, "src/bookmarklet"), { recursive: true });
  writeFileSync(join(root, "src/bookmarklet/host.ts"), "document.documentElement.dataset.bookmarkletTest = 'ready';");
  server = await createServer({ configFile: false, root, plugins: [playgroundBookmarklet({ root, dir: root })], server: { host: "127.0.0.1", port: 0 }, optimizeDeps: { noDiscovery: true } });
  await server.listen();
  const address = server.httpServer?.address();
  if (!address || typeof address === "string") throw new Error("Missing bookmarklet test address");
  const response = await fetch(`http://127.0.0.1:${address.port}${BOOKMARKLET_ROUTE}`);
  expect(response.status).toBe(200);
  expect(await response.text()).toContain("bookmarkletTest");
}, 30_000);
