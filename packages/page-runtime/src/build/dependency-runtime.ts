import { createHash } from "node:crypto";
import { isBuiltin } from "node:module";
import { readFileSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { rolldown, type Plugin } from "rolldown";
import { ClosureTracer, createResolver, IMPORT_CONDITIONS, moduleFormat, packageName, packageOf, resolveBrowser } from "./trace.ts";
import { dependencyBarrels } from "./dependency-barrels.ts";
import { commonJsExportNames, type CommonJsExports } from "./commonjs-exports.ts";
import { optionalDependency } from "./dependency-optional.ts";
import { bundleWorkerURLs } from "./dependency-workers.ts";
import { satisfiesVersion } from "../sw/versions.ts";

export interface DependencyRuntimeOptions {
  root: string;
  outDir: string;
  entries: string[];
  target: "node" | "browser";
  external?: Record<string, string>;
  externalVersions?: Record<string, string>;
  resolvedEntries?: Record<string, string>;
  exports?: Record<string, string[]>;
}

export interface DependencyRuntime {
  schema: 1;
  target: "node" | "browser";
  imports: Record<string, string>;
  integrity: Record<string, string>;
  inputs: Record<string, string>;
  styles: string[];
}

export function buildInstalledDependencyRuntime(options: DependencyRuntimeOptions): Promise<DependencyRuntime> {
  return buildDependencyRuntime(options, "installed");
}

export async function buildDependencyRuntime(options: DependencyRuntimeOptions, barrelSource: "published" | "installed" = "published"): Promise<DependencyRuntime> {
  if (!options.entries.length) throw new Error("A dependency runtime requires at least one entry");
  const root = resolve(options.root);
  const entries = [...new Set(options.entries)].sort();
  const inputs: Record<string, string> = {};
  const trackInput = (path: string, code: string) => { inputs[path] = createHash("sha256").update(code).digest("hex"); };
  const styles = new Set<string>();
  const assets = new Set<string>();
  const workers = new Map<string, Promise<string>>();
  const resolved = new Map<string, string>();
  const peersByPackage = new Map<string, Record<string, string>>();
  let commonJs: CommonJsExports = {};
  const browserResolver = createResolver(IMPORT_CONDITIONS);
  const plugin: Plugin = {
    name: "dependency-runtime",
    async buildStart() {
      for (const entry of entries) {
        if (options.resolvedEntries?.[entry]) {
          resolved.set(entry, options.resolvedEntries[entry]);
          continue;
        }
        const result = await this.resolve(entry, join(root, "package.json"), { skipSelf: true });
        if (!result || result.external) throw new Error(`Cannot resolve runtime entry ${entry} from ${root}`);
        resolved.set(entry, result.id);
      }
      const paths = [...new Set(resolved.values())].filter(path => moduleFormat(path).format === "commonjs");
      commonJs = await commonJsExportNames(paths);
    },
    async resolveId(source, importer, extra) {
      if (source.startsWith("\0external-require:")) return source;
      if (options.external?.[source]) {
        const version = options.externalVersions?.[packageName(source)];
        const from = version && importer && !importer.startsWith("\0") ? importer : undefined;
        const original = version || extra.kind === "require-call" ? await this.resolve(source, from ?? join(root, "package.json"), { ...extra, skipSelf: true }) : undefined;
        let sharedPeer = false;
        if (version && from) {
          const pkg = packageOf(from);
          if (!peersByPackage.has(pkg.dir)) peersByPackage.set(pkg.dir, JSON.parse(readFileSync(join(pkg.dir, "package.json"), "utf8")).peerDependencies ?? {});
          const range = peersByPackage.get(pkg.dir)?.[packageName(source)];
          if (range) {
            if (!satisfiesVersion(version, range)) throw new Error(`${pkg.name} requires ${packageName(source)}@${range}; the runtime provides ${version}`);
            sharedPeer = true;
          }
        }
        if (!version || sharedPeer || !original || original.external || packageOf(original.id).version === version) {
          if (extra.kind !== "require-call") return { id: source, external: true };
          const commonJs = !original || original.external ? moduleFormat(options.external[source]).module.staticExports.some(item => item.entries.some(entry => entry.exportName.kind === "Default")) : moduleFormat(original.id).format === "commonjs";
          return `\0external-require:${JSON.stringify({ source, commonJs })}`;
        }
      }
      if (isBuiltin(source)) {
        if (options.target === "browser") {
          const mapped = importer && resolveBrowser({ resolver: browserResolver, fromDir: dirname(importer), specifier: source });
          if (mapped && mapped.empty) return "\0browser-empty";
          if (mapped && mapped.path) return mapped.path;
          throw new Error(`Browser runtime cannot import ${source} from ${importer}`);
        }
        return { id: source, external: true };
      }
      if (source.startsWith("\0entry:")) return source;
      if (extra.kind === "dynamic-import" && importer && optionalDependency({ source, importer })) {
        return await this.resolve(source, importer, { ...extra, skipSelf: true }) ?? { id: source, external: true };
      }
      if (importer?.startsWith("\0entry:")) return this.resolve(source, join(root, "package.json"), { ...extra, skipSelf: true });
      if (/^(react|react-dom|scheduler)(\/|$)/.test(source)) return this.resolve(source, join(root, "package.json"), { ...extra, skipSelf: true });
      return null;
    },
    load(id) {
      if (id === "\0browser-empty") return "export default {};";
      if (id.startsWith("\0external-require:")) {
        const { source, commonJs } = JSON.parse(id.slice("\0external-require:".length)) as { source: string; commonJs: boolean };
        return `import * as ns from ${JSON.stringify(source)}; module.exports = ${commonJs ? "ns.default" : "ns"};`;
      }
      if (id.endsWith(".css")) {
        const tracer = new ClosureTracer({ name: "dependency-styles", resolveFrom: root, entries: [], topLevel: [], inherits: [] });
        tracer.target(id, id, "relative");
        if (tracer.failures.length) throw new Error(tracer.failures.map(item => item.detail).join("\n"));
        for (const file of tracer.files.values()) {
          const fileName = `assets/${file.url}`;
          const source = readFileSync(file.path);
          inputs[file.path] = createHash("sha256").update(source).digest("hex");
          if (file.path === id) styles.add(fileName);
          if (!assets.has(fileName)) this.emitFile({ type: "asset", fileName, source });
          assets.add(fileName);
        }
        return { code: "export {};", moduleType: "js" };
      }
      if (!id.startsWith("\0entry:")) return null;
      const specifier = id.slice(7, -4);
      const path = resolved.get(specifier);
      if (!path) throw new Error(`Missing resolved runtime entry ${id}`);
      const names = commonJs[path]?.names;
      const requested = options.exports?.[specifier];
      if (!names) {
        const source = JSON.stringify(options.resolvedEntries?.[specifier] ?? specifier);
        if (requested) return `import { ${requested.map((name, index) => `${JSON.stringify(name)} as e${index}`).join(", ")} } from ${source}; export { ${requested.map((name, index) => `e${index} as ${JSON.stringify(name)}`).join(", ")} };`;
        return `export * from ${source}; ${moduleFormat(path).module.staticExports.some(item => item.entries.some(entry => entry.exportName.kind === "Default" || entry.exportName.name === "default")) ? `export { default } from ${source};` : ""}`;
      }
      const exported = names.filter(name => name !== "default" && name !== "__esModule");
      return [`import value from ${JSON.stringify(path)};`, "export default value;", ...exported.map((name, index) => `const e${index} = value[${JSON.stringify(name)}]; export { e${index} as ${JSON.stringify(name)} };`)].join("\n");
    },
    async transform(code, id) {
      if (!id.startsWith("\0") && !id.endsWith(".css")) trackInput(id, code);
      if (id.startsWith("\0")) return null;
      if (options.target === "browser" && code.includes("import.meta.url")) code = await bundleWorkerURLs({ code, id, context: this, workers, trackInput });
      return code.replace(/new URL\(\s*(['"])(\.{1,2}\/[^'"]+)\1\s*,\s*import\.meta\.url\s*\)/g, (_match, _quote: string, reference: string) => {
        const path = resolve(dirname(id), reference);
        const source = readFileSync(path);
        inputs[path] = createHash("sha256").update(source).digest("hex");
        const asset = this.emitFile({ type: "asset", name: basename(path), source });
        return `new URL(import.meta.ROLLUP_FILE_URL_${asset})`;
      });
    },
  };
  await rm(options.outDir, { recursive: true, force: true });
  await mkdir(options.outDir, { recursive: true });
  const bundle = await rolldown({
    input: Object.fromEntries(entries.map((specifier, index) => [`entry-${index}`, `\0entry:${specifier}.mjs`])),
    plugins: [plugin, dependencyBarrels({ target: options.target, root, barrelSource, external: new Set(Object.keys(options.external ?? {})) })],
    platform: options.target,
    resolve: { conditionNames: [options.target, "import", "default"], mainFields: options.target === "browser" ? ["browser", "module", "main"] : ["module", "main"], aliasFields: options.target === "browser" ? [["browser"]] : [] },
    transform: { define: { "process.env.NODE_ENV": JSON.stringify("development") } },
    onLog(level, log, handler) {
      if (log.code === "UNRESOLVED_IMPORT") throw new Error(log.message);
      // Page runtimes execute whole React trees; React Server Component boundaries do not apply.
      if (log.code === "MODULE_LEVEL_DIRECTIVE") return;
      handler(level, log);
    },
  });
  try {
    const paths = Object.fromEntries(Object.entries(options.external ?? {}).map(([specifier, path]) => {
      const value = relative(options.outDir, path).split(sep).join("/");
      return [specifier, value.startsWith(".") ? value : `./${value}`];
    }));
    const { output } = await bundle.write({ dir: options.outDir, format: "esm", entryFileNames: "[name].mjs", chunkFileNames: "[name]-[hash].mjs", paths, ...(options.target === "node" ? { banner: 'import { createRequire as __runtimeRequire } from "node:module"; const require = __runtimeRequire(import.meta.url);' } : {}) });
    if (options.target === "browser") {
      for (const item of output) if (item.type === "chunk" && /(?<![\w$.])__require\s*\(/.test(item.code)) throw new Error(`Browser dependency runtime ${item.fileName} still contains a dynamic require`);
    }
    const imports = Object.fromEntries(entries.map((specifier, index) => [specifier, `entry-${index}.mjs`]));
    const integrity = Object.fromEntries(output.map(item => [item.fileName, createHash("sha256").update(readFileSync(join(options.outDir, item.fileName))).digest("hex")]));
    const runtime: DependencyRuntime = { schema: 1, target: options.target, imports, integrity, inputs, styles: [...styles] };
    await writeFile(join(options.outDir, "runtime.json"), JSON.stringify(runtime, null, 2));
    return runtime;
  } finally { await bundle.close(); }
}
