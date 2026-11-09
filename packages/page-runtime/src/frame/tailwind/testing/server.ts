import { createServer } from "node:http";
import { readFile, readdir, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "rolldown";
import { compile, optimize } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";
import autoprefixer from "autoprefixer";
import postcss from "postcss";
import { layerOrder, type PageStylesRecipe } from "../recipe.ts";
import { parityPages, pageFile } from "./pages.ts";

const pkg = fileURLToPath(new URL("../../../..", import.meta.url));
const facetRoot = resolve(pkg, "../../../facet");
const repo = resolve(pkg, "../..");
const require = createRequire(import.meta.url);
const facetRequire = createRequire(resolve(facetRoot, "package.json"));

async function fixtures() {
  const recipePath = resolve(facetRoot, "dist/page-styles/index.mjs");
  const { default: facet } = facetRequire("./dist/page-styles/index.mjs") as { default: PageStylesRecipe };
  const sources: string[] = [];
  for (const dir of ["kitchen-sink", "office"]) {
    for (const name of await readdir(resolve(facetRoot, "examples", dir))) if (/\.(tsx?|json)$/.test(name)) sources.push(await readFile(resolve(facetRoot, "examples", dir, name), "utf8"));
  }
  const stylesheets = Object.fromEntries(await Promise.all(["theme.css", "utilities.css"].map(async (file) => [`tailwindcss/${file}`, await readFile(require.resolve(`tailwindcss/${file}`), "utf8")])));
  const baseSheets = new Map([
    ["/base/clicky.css", await readFile(resolve(repo, "packages/ui/dist/styles.css"), "utf8")],
    ["/base/facet.css", await readFile(resolve(facetRoot, "dist/styles.css"), "utf8")],
  ]);
  return { recipePath, facet, sources, stylesheets, baseSheets };
}

async function bundle(data: Awaited<ReturnType<typeof fixtures>>) {
  const pages = parityPages.map((name) => `${JSON.stringify(name)}: () => import(${JSON.stringify(resolve(facetRoot, "examples", pageFile(name)))})`).join(",");
  const source = [
    `import { run } from ${JSON.stringify(resolve(pkg, "src/frame/tailwind/testing/client.ts"))};`,
    `import facet from ${JSON.stringify(data.recipePath)};`,
    `import clicky from ${JSON.stringify(resolve(repo, "packages/ui/src/page-styles.ts"))};`,
    `import preset from ${JSON.stringify(resolve(repo, "packages/ui/src/tailwind-preset.ts"))};`,
    `import facetPreset from ${JSON.stringify(resolve(facetRoot, "dist/page-styles/preset.mjs"))};`,
    `import typography from ${JSON.stringify(facetRequire.resolve("@tailwindcss/typography"))};`,
    `import officeData from ${JSON.stringify(resolve(facetRoot, "examples/office/data.json"))};`,
    `const sheets = ${JSON.stringify(data.stylesheets)};`,
    `const loaders = { loadStylesheet: async (id, base) => { if (!(id in sheets)) throw new Error('missing stylesheet '+id); return {path:id,base,content:sheets[id]}; }, loadModule: async (id,base) => { const modules = {'@tailwindcss/typography': typography, '@flanksource/clicky-ui/tailwind-preset':preset, '@flanksource/facet/tailwind-preset':facetPreset}; if (!(id in modules)) throw new Error('missing module '+id); return {path:id,base,module:modules[id]}; } };`,
    `const options = {libraries:[{id:'clicky',name:clicky.name,version:'parity',integrity:'sha384-parity-clicky',base:location.origin+'/clicky/',recipe:clicky},{id:'facet',name:facet.name,version:'parity',integrity:'sha384-parity-facet',base:location.origin+'/facet/',recipe:facet}],base:${JSON.stringify([...data.baseSheets.keys()])},loaders,candidates:${JSON.stringify([...new Set(data.sources.flatMap((text) => text.match(/[^<>"'`\s]*[^<>"'`\s:]/g) ?? []))])},pages:{${pages}},data:officeData};`,
    `run(options).then(value => {document.getElementById('result').textContent=JSON.stringify(value);document.title='DONE';},error => {document.getElementById('result').textContent=JSON.stringify({error:String(error),stack:error.stack});document.title='DONE';});`,
  ].join("\n");
  const output = await build({ input: "tailwind:fixture", platform: "browser", resolve: { alias: { "@flanksource/clicky-ui/tailwind-preset": resolve(repo, "packages/ui/src/tailwind-preset.ts"), "@facet":resolve(facetRoot, "dist/components/index.js"), "@flanksource/facet": resolve(facetRoot, "dist/components/index.js"), react: require.resolve("react"), "react-dom/client": require.resolve("react-dom/client") } }, transform: { jsx: { runtime: "automatic" }, define: { "process.env.NODE_ENV": '"development"', "process.env": "{}" } }, plugins: [{ name: "fixture", resolveId: (id) => id === "tailwind:fixture" ? id : null, load: (id) => id === "tailwind:fixture" ? source : null }], output: { format: "es", dir: resolve(repo, ".tmp/E/browser"), entryFileNames: "entry.js", chunkFileNames: "[name]-[hash].js" }, write: false });
  return new Map(output.output.map((file) => [file.fileName, file.type === "chunk" ? file.code : file.source]));
}

async function reference(data: Awaited<ReturnType<typeof fixtures>>) {
  const dir = resolve(repo, ".tmp/E/reference"); await mkdir(dir, { recursive: true });
  const entry = [layerOrder, data.facet.entry].join("\n");
  const compiler = await compile(entry, { base: dir, onDependency: () => {}, customCssResolver: async (id) => require.resolve(id), customJsResolver: async (id) => id === "@flanksource/facet/tailwind-preset" ? resolve(facetRoot, "dist/page-styles/preset.mjs") : id === "@flanksource/clicky-ui/tailwind-preset" ? resolve(repo, "packages/ui/dist/tailwind-preset.js") : facetRequire.resolve(id) });
  return (html: string) => {
    const candidates = new Scanner({}).scanFiles([...data.sources.map((content) => ({ content, extension: "tsx" })), { content: html, extension: "html" }]);
    const css = postcss([autoprefixer()]).process(optimize(compiler.build(candidates)).code, { from: undefined }).css;
    return data.facet.transform!(css);
  };
}

export async function startTailwindServer() {
  const data = await fixtures();
  const files = await bundle(data);
  const buildReference = await reference(data);
  const references = new Map<string, string>();
  const server = createServer((req, res) => { void (async () => {
    const url = new URL(req.url!, "http://localhost");
    if (url.pathname.startsWith("/reference/")) {
      const name = url.pathname.slice(11);
      if (req.method === "POST") { const chunks = []; for await (const chunk of req) chunks.push(chunk); references.set(name, buildReference(Buffer.concat(chunks).toString())); }
      if (!references.has(name)) throw new Error(`reference missing for ${name}`);
      res.setHeader("content-type", "text/css"); res.end(references.get(name)); return;
    }
    const base = data.baseSheets.get(url.pathname);
    if (base !== undefined) { res.setHeader("content-type", "text/css"); res.end(base); return; }
    if (url.pathname === "/delayed.css") { await new Promise((resolve) => setTimeout(resolve, 200)); res.setHeader("content-type", "text/css"); res.end("body { --imported: yes; }"); return; }
    if (url.pathname === "/missing.css") { res.statusCode = 404; res.end("missing"); return; }
    const file = files.get(url.pathname.slice(1));
    if (file !== undefined) { res.setHeader("content-type", "text/javascript"); res.end(file); return; }
    res.setHeader("content-type", "text/html"); res.end('<!doctype html><html><head><title>RUNNING</title></head><body><div id="root"></div><output id="result" hidden></output><script type="module" src="/entry.js"></script></body></html>');
  })().catch((error: unknown) => { res.statusCode = 500; res.end(String(error)); }); });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address(); if (!address || typeof address === "string") throw new Error("no test server port");
  return { url: `http://127.0.0.1:${address.port}`, close: () => new Promise<void>((resolve, reject) => { server.closeAllConnections(); server.close((error) => error ? reject(error) : resolve()); }) };
}
