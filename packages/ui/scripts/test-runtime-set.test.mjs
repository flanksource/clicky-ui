import { readFile, readdir } from "node:fs/promises";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";
import { composeImportMap } from "../../page-runtime/src/build/index.ts";
import { librarySpec } from "../../page-runtime/src/build/library-runtime.ts";
import { ClosureTracer } from "../../page-runtime/src/build/trace.ts";
import { defineNodeEnv } from "../../page-runtime/src/sw/module-transform.ts";

const execute = promisify(execFile);
const libraryDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fragment = JSON.parse(await readFile(resolve(libraryDir, "dist/runtime/importmap.json"), "utf8"));
const spec = librarySpec({ libraryDir });
const tracer = new ClosureTracer(spec).trace();
const react = JSON.parse(await readFile(resolve(libraryDir, "node_modules/react/package.json"), "utf8"));
const manifest = JSON.parse(await readFile(resolve(libraryDir, "package.json"), "utf8"));

const hook = `globalThis.__reactInstances = new Set();
globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
  supportsFiber: true, renderers: new Map(),
  inject(value) { const id = this.renderers.size + 1; this.renderers.set(id, value); return id; },
  onScheduleFiberRoot() {}, onCommitFiberRoot() {}, onCommitFiberUnmount() {}, onPostCommitFiberRoot() {}, checkDCE() {}
};`;

const pageSource = `import React, { createElement as h, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { ThemeProvider } from "/npm/${fragment.name}@${manifest.version}/dist/hooks/theme-provider.js";
import { useTheme } from "/npm/${fragment.name}@${manifest.version}/dist/hooks/use-theme.js";
globalThis.__reactInstances.add(React);
function Probe() {
  const { resolvedTheme } = useTheme();
  const [value] = useState(3);
  const element = h("span", null, value);
  useEffect(() => { globalThis.__result = { theme: resolvedTheme, value, version: React.version, owner: Boolean(element._owner), frozen: Object.isFrozen(element), markup: renderToStaticMarkup(h("b", null, value)) }; }, [resolvedTheme]);
  return element;
}
createRoot(document.getElementById("root")).render(h(ThemeProvider, { defaultTheme: "dark" }, h(Probe)));`;

async function serve({ duplicate }) {
  const { map, failures } = composeImportMap([fragment], "/npm/");
  expect(failures).toEqual([]);
  if (duplicate) map.scopes[`/npm/${fragment.name}@${manifest.version}/dist/`] = { react: "/duplicate-react.js" };
  const html = `<!doctype html><link rel="icon" href="data:,"><script>${hook}</script><script type="importmap">${JSON.stringify(map)}</script><div id="root"></div><script type="module" src="/page.js"></script>`;
  const serverErrors = [];
  const server = createServer((request, response) => {
    (async () => {
      const path = new URL(request.url, "http://localhost").pathname;
      response.setHeader("content-type", path === "/" ? "text/html" : "text/javascript");
      if (path === "/") return response.end(html);
      if (path === "/page.js") return response.end(pageSource);
      const url = path === "/duplicate-react.js" ? fragment.imports.react : decodeURIComponent(path.slice("/npm/".length));
      const file = url.startsWith(spec.runtimeBase) ? resolve(libraryDir, "dist/runtime", url.slice(spec.runtimeBase.length)) : tracer.files.get(url)?.path;
      if (!file || !(url in fragment.integrity)) throw new Error(`untraced runtime request ${path}`);
      let code = defineNodeEnv(await readFile(file, "utf8")).code;
      expect(code).not.toMatch(/react\.production(?:\.min)?\.js|NODE_ENV\s*===?\s*["']production["']/);
      if (/from ["']react["']/.test(code)) code += '\nimport * as __probeReact from "react"; globalThis.__reactInstances.add(__probeReact.default);';
      if (path === "/duplicate-react.js") code = code.replaceAll('"./', `"/npm/${url.slice(0, url.lastIndexOf("/") + 1)}`).replaceAll('"../', `"/npm/${url.slice(0, url.lastIndexOf("/") + 1)}../`);
      response.end(code);
    })().catch((error) => { serverErrors.push(String(error)); response.writeHead(500); response.end(String(error)); });
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  return { server, serverErrors, url: `http://127.0.0.1:${server.address().port}` };
}

function browser(session, ...args) {
  return execute("agent-browser", ["--engine", "chrome", "--session", session, ...args], { timeout: 45000, maxBuffer: 2_000_000 }).then(({ stdout }) => stdout.trim());
}

it("publishes only development React modules", async () => {
  const root = resolve(libraryDir, "dist/runtime");
  const files = await readdir(root, { recursive: true });
  expect(files.filter((path) => /^(development|production)(\/|$)/.test(path))).toEqual([]);
  for (const file of files.filter((path) => path.endsWith(".js"))) {
    expect(await readFile(resolve(root, file), "utf8")).not.toMatch(/react\.production(?:\.min)?\.js|NODE_ENV\s*===?\s*["']production["']/);
  }
});

it("loads the published runtime with one development React and one development renderer", async () => {
  const session = `runtime-set-${process.pid}`;
  const { server, serverErrors, url } = await serve({ duplicate: false });
  let launched = false;
  try {
    await browser(session, "open", url);
    launched = true;
    await browser(session, "set", "media", "dark");
    await browser(session, "wait", "--fn", 'globalThis.__result?.theme === "dark"');
    const result = JSON.parse(await browser(session, "eval", '({ ...globalThis.__result, instances: globalThis.__reactInstances.size, renderers: [...globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers.values()].map(r => r.bundleType) })'));
    expect(result, JSON.stringify(result)).toEqual({ theme: "dark", value: 3, version: react.version, owner: true, frozen: true, markup: "<b>3</b>", instances: 1, renderers: [1] });
    expect(serverErrors).toEqual([]);
    expect(JSON.parse(await browser(session, "errors", "--json")).data.errors).toEqual([]);
  } finally {
    try { if (launched) await browser(session, "close"); } finally { await new Promise((done, fail) => server.close((error) => error ? fail(error) : done())); }
  }
});

it("detects a second React instance in the duplicate control", async () => {
  const session = `runtime-set-duplicate-${process.pid}`;
  const { server, serverErrors, url } = await serve({ duplicate: true });
  let launched = false;
  try {
    await browser(session, "open", url);
    launched = true;
    await browser(session, "wait", "--fn", "globalThis.__reactInstances.size === 2");
    await expect.poll(() => browser(session, "errors", "--json")).toMatch(/hook|Cannot read properties of null|Minified React error/);
    expect(serverErrors).toEqual([]);
  } finally {
    try { if (launched) await browser(session, "close"); } finally { await new Promise((done, fail) => server.close((error) => error ? fail(error) : done())); }
  }
});
