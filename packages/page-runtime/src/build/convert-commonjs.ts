import { execFileSync } from "node:child_process";
import { dirname, extname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { rolldown, type OutputAsset, type OutputChunk, type Plugin, type PreRenderedChunk } from "rolldown";
import { CommonJsConversionError } from "./errors.ts";
import { specifierKind } from "./module-utils.ts";
import { type ClosureTracer, type CommonJsEntry, createResolver, integrityOf, moduleFormat, packageName, packageOf, REQUIRE_CONDITIONS, resolveBrowser } from "./trace.ts";

export type ConversionStats = { entries: number; chunks: number; bytes: number; ms: number };

type ExportNames = Record<string, { names?: string[]; error?: string }>;

const ENTRY = "\0runtime-entry:";
const REQUIRE_EXTERNAL = "\0runtime-require:";
const EMPTY = "\0runtime-empty";
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
const JS_EXTENSIONS = new Set([".js", ".mjs", ".cjs"]);
// rolldown turns a require it cannot resolve into a call to its __require shim, which throws in a browser.
const LEFTOVER_REQUIRE = /(?<![\w$.])__require\s*\(/;
const here = dirname(fileURLToPath(import.meta.url));

function exportNames(entries: CommonJsEntry[]): ExportNames {
  const output = execFileSync(process.execPath, [join(here, "cjs-export-names.mjs")], {
    input: JSON.stringify(entries.map((entry) => entry.path)),
    env: { ...process.env, NODE_ENV: "development" },
    encoding: "utf8",
    stdio: ["pipe", "pipe", "ignore"],
    maxBuffer: 64 * 1024 * 1024,
    timeout: 30_000,
  });
  const result = JSON.parse(output) as ExportNames;
  for (const entry of entries) {
    const item = result[entry.path];
    if (!item?.names || item.error) throw new CommonJsConversionError(`${entry.pkg.name}: listing ${entry.specifier} exports threw: ${item?.error ?? "no export list returned"}`);
  }
  return result;
}

/** The ESM face of one CommonJS entry: its `module.exports` as the default export plus an explicit named-export list. */
function entrySource(entry: CommonJsEntry, names: string[]): string {
  const exported = names.filter((name) => name !== "default" && name !== "__esModule");
  const lines = [`import * as ns from ${JSON.stringify(entry.path)};`];
  lines.push("export default ns.default;");
  exported.forEach((name, index) => lines.push(`const __e${index} = ns[${JSON.stringify(name)}];`));
  if (exported.length > 0) {
    const specifiers = exported.map((name, index) => `__e${index} as ${IDENTIFIER.test(name) ? name : JSON.stringify(name)}`);
    lines.push(`export { ${specifiers.join(", ")} };`);
  }
  return `${lines.join("\n")}\n`;
}

/**
 * Resolves cross-package `require`s through a CommonJS adapter that imports the shared ESM copy,
 * preserving module.exports identity instead of converting an ESM namespace back to CommonJS.
 */
function runtimeSetPlugin(tracer: ClosureTracer, names: ExportNames): Plugin {
  const { runtimeBase, inherits, topLevel } = tracer.spec;
  if (!runtimeBase) throw new Error(`${tracer.spec.name} has no runtime set to convert CommonJS into`);
  const requireResolver = createResolver(REQUIRE_CONDITIONS);
  const external = (options: { source: string; kind: string; path?: string; owner?: string }) =>
    options.kind === "require-call" ? `${REQUIRE_EXTERNAL}${JSON.stringify(options)}` : { id: options.source, external: true };
  return {
    name: "page-runtime-set",
    resolveId(source, importer, { kind }) {
      if (source === EMPTY || source.startsWith(ENTRY) || source.startsWith(REQUIRE_EXTERNAL)) return source;
      if (!importer || importer.startsWith(ENTRY)) return null;
      if (importer.startsWith(REQUIRE_EXTERNAL)) return { id: source, external: true };
      const from = packageOf(importer);
      const resolved = resolveBrowser({ resolver: kind === "require-call" ? requireResolver : tracer.resolver, fromDir: dirname(importer), specifier: source });
      if (resolved.empty) return EMPTY;
      if (resolved.builtin || (specifierKind(source) === "builtin" && !resolved.path)) {
        tracer.fail(from.name, `CommonJS code in ${from.name}@${from.version} requires Node built-in ${resolved.builtin?.resolved ?? source}`);
        return { id: source, external: true };
      }
      if (specifierKind(source) === "relative") return null;
      const name = packageName(source);
      if (inherits.includes(name)) {
        tracer.inherit(source, runtimeBase);
        return external({ source, kind, ...(resolved.path ? { path: resolved.path } : {}) });
      }
      if (topLevel.includes(name)) {
        const url = tracer.provideTopLevel(source);
        if (!url) throw new Error(`cannot resolve base-set entry ${source}`);
        return external({ source, kind, ...(resolved.path ? { path: resolved.path } : {}) });
      }
      if (!resolved.path) {
        tracer.fail(name, `CommonJS code in ${from.name}@${from.version} requires ${source}, which does not resolve (${resolved.error})`);
        return { id: source, external: true };
      }
      if (!JS_EXTENSIONS.has(extname(resolved.path))) return resolved.path;
      const url = tracer.target(resolved.path, source, "bare");
      const owner = `${from.name}@${from.version}`;
      if (url) tracer.mapInScope(`${runtimeBase}${owner}/`, source, url);
      return external({ source, kind, path: resolved.path, owner });
    },
    load(id) {
      if (id === EMPTY) return "module.exports = {};";
      if (id.startsWith(ENTRY)) {
        const entry = tracer.commonJs.get(id.slice(ENTRY.length));
        if (!entry) throw new Error(`unknown runtime-set entry ${id}`);
        const exported = names[entry.path]?.names;
        if (!exported) throw new CommonJsConversionError(`${entry.specifier}: missing explicit export list`);
        return entrySource(entry, exported);
      }
      if (id.startsWith(REQUIRE_EXTERNAL)) {
        const { source, path } = JSON.parse(id.slice(REQUIRE_EXTERNAL.length)) as { source: string; path?: string };
        const specifier = JSON.stringify(source);
        const value = path && moduleFormat(path).format === "commonjs" ? "ns.default" : "ns";
        return `import * as ns from ${specifier};\nmodule.exports = ${value};\n`;
      }
      return null;
    },
  };
}

function chunkFileName(chunk: PreRenderedChunk): string {
  const owners = new Set<string>();
  for (const id of chunk.moduleIds) {
    if (id.startsWith(REQUIRE_EXTERNAL)) {
      const { owner } = JSON.parse(id.slice(REQUIRE_EXTERNAL.length)) as { owner?: string };
      if (owner) owners.add(owner);
    } else if (isAbsolute(id) && JS_EXTENSIONS.has(extname(id))) {
      const pkg = packageOf(id);
      owners.add(`${pkg.name}@${pkg.version}`);
    }
  }
  if (owners.size > 1) throw new CommonJsConversionError(`shared chunk ${chunk.name} combines dependency scopes ${[...owners].join(", ")}`);
  const [owner] = owners;
  return `${owner ? `${owner}/` : ""}_chunks/[name]-[hash].js`;
}

async function build(tracer: ClosureTracer, names: ExportNames, outDir: string | null) {
  const entries = [...tracer.commonJs.values()];
  const bundle = await rolldown({
    input: Object.fromEntries(entries.map((entry) => [entry.name, `${ENTRY}${entry.name}`])),
    plugins: [runtimeSetPlugin(tracer, names)],
    platform: "browser",
    transform: { define: { "process.env.NODE_ENV": JSON.stringify("development") } },
    logLevel: "silent",
  });
  const options = { format: "esm", entryFileNames: "[name].js", chunkFileNames: chunkFileName } as const;
  try {
    return (outDir ? await bundle.write({ ...options, dir: outDir }) : await bundle.generate(options)).output;
  } finally {
    await bundle.close();
  }
}

function register(tracer: ClosureTracer, outDir: string, output: Array<OutputChunk | OutputAsset>): number {
  const fileNames = new Set(output.map((item) => item.fileName));
  let bytes = 0;
  for (const item of output) {
    if (item.type !== "chunk") throw new Error(`converting CommonJS emitted an asset: ${item.fileName}`);
    const url = `${tracer.spec.runtimeBase}${item.fileName}`;
    const leftover = item.code.split("\n").find((line) => LEFTOVER_REQUIRE.test(line));
    if (leftover) {
      const owners = [...new Set(item.moduleIds.filter((id) => !id.startsWith("\0")).map((id) => packageOf(id).name))];
      tracer.fail(owners.join(", "), `${url} still calls require through rolldown's shim: ${leftover.trim().slice(0, 160)}`);
    }
    const bareImports = [...item.imports, ...item.dynamicImports].filter((id) => !fileNames.has(id));
    tracer.files.set(url, { url, path: join(outDir, item.fileName), kind: "esm", integrity: integrityOf(item.code), bareImports });
    bytes += Buffer.byteLength(item.code);
  }
  return bytes;
}

/**
 * Converts every CommonJS-only entry the tracer found into the development runtime set. Converting
 * can reach ESM packages, whose imports can reach more CommonJS entries, so discovery repeats until it is stable.
 */
export async function convertCommonJs(tracer: ClosureTracer, outDir: string): Promise<ConversionStats[]> {
  if (tracer.commonJs.size === 0) return [];
  for (let known = -1; known !== tracer.commonJs.size; ) {
    known = tracer.commonJs.size;
    await build(tracer, exportNames([...tracer.commonJs.values()]), null);
    tracer.drain();
  }
  const started = performance.now();
  const entries = [...tracer.commonJs.values()];
  const output = await build(tracer, exportNames(entries), outDir);
  const bytes = register(tracer, outDir, output);
  return [{ entries: entries.length, chunks: output.length, bytes, ms: Math.round(performance.now() - started) }];
}
