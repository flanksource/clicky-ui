import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { build, type Plugin, type ViteDevServer } from "vite";
import { liveRegistry, sharedImports } from "./production-registry";
import {
  productionAssets,
  PRODUCTION_ASSET_BASE as assetBase,
} from "./production-assets";

import { productionChanges } from "./production-changes";

const sharedPrefix = "\0playground-compiled:";

type SharedModule = { file: string; exports: string[] };
type ProductionOptions = { root: string; outDir?: string };

export function playgroundProduction(options: ProductionOptions): Plugin {
  const root = realpathSync(options.root);
  const outDir = options.outDir ?? resolve(root, "dist");
  const modules = new Map<string, SharedModule>();
  const imports = sharedImports(root);
  let server: ViteDevServer;
  let closeChanges: (() => void) | undefined;
  return {
    name: "playground-production",
    enforce: "pre",
    async config() {
      return {
        cacheDir: resolve(root, "node_modules/.vite-playground-prod"),
        optimizeDeps: { exclude: await imports },
        server: {
          hmr: false,
          preTransformRequests: false,
          watch: { ignored: [resolve(root, ".tmp/**")] },
        },
      };
    },
    async configResolved(config) {
      const shared = new Set(await imports);
      if (config.optimizeDeps.include) {
        config.optimizeDeps.include = config.optimizeDeps.include.filter(
          (specifier) => !shared.has(specifier),
        );
      }
    },
    async resolveId(source, importer) {
      if (source.startsWith(assetBase)) return { id: source, external: true };
      if (source.startsWith(sharedPrefix)) return source;
      if (modules.has(source)) return sharedPrefix + source;
      if (!importer || source.includes("?") || source.startsWith("\0")) return;
      const resolved = await this.resolve(source, importer, { skipSelf: true });
      const id = resolved?.id.replace(/\?v=[^&]+$/, "");
      if (id && modules.has(id)) return sharedPrefix + id;
      return;
    },
    load(id) {
      if (!id.startsWith(sharedPrefix)) return;
      const compiled = modules.get(id.slice(sharedPrefix.length));
      if (!compiled) throw new Error(`No compiled module for ${id}`);
      return `export { ${compiled.exports.join(", ")} } from ${JSON.stringify(assetBase + compiled.file)};`;
    },
    async configureServer(devServer) {
      server = devServer;
      await compileShell({
        server,
        root,
        outDir,
        modules,
        specifiers: await imports,
      });
      const changes = productionChanges(server, root);
      closeChanges = changes.close;
      server.middlewares.use(await productionAssets({ root, outDir, revision: changes.revision }));
    },
    closeBundle() { closeChanges?.(); },
  };
}

async function compileShell({
  server,
  root,
  outDir,
  modules,
  specifiers,
}: {
  server: ViteDevServer;
  root: string;
  outDir: string;
  modules: Map<string, SharedModule>;
  specifiers: string[];
}): Promise<void> {
  const entries: Record<string, string> = {
    index: resolve(root, "index.html"),
  };
  const require = createRequire(resolve(root, "package.json"));
  const reactEntries = new Map<string, string>();
  const aliases = new Map<string, string>();
  for (const [index, specifier] of specifiers.entries()) {
    const resolved =
      await server.environments.client?.pluginContainer.resolveId(
        specifier,
        resolve(root, "src/main.tsx"),
      );
    if (!resolved)
      throw new Error(`Cannot compile shared playground import: ${specifier}`);
    const id = resolved.id.replace(/\?v=[^&]+$/, "");
    aliases.set(specifier, id);
    const name = `shared-${index}`;
    entries[name] = id;
    if (/^react(?:-dom)?(?:\/|$)/.test(specifier)) {
      const names = Object.keys(require(id)).filter(
        (key) => key !== "default" && key !== "__esModule",
      );
      reactEntries.set(
        id,
        `export { default, ${names.join(", ")} } from ${JSON.stringify(specifier)};`,
      );
      entries[name] = "\0production-react:" + id;
    }
  }
  await build({
    configFile: server.config.configFile ?? false,
    root,
    mode: "production",
    logLevel: "warn",
    base: assetBase,
    define: { "import.meta.env.PLAYGROUND_LIVE": "true" },
    plugins: [
      {
        name: "playground-production-shell",
        enforce: "pre",
        resolveId(id) {
          if (id.startsWith("\0production-react:")) return id;
          return;
        },
        load(id) {
          if (id.startsWith("\0production-react:")) {
            return reactEntries.get(id.slice("\0production-react:".length));
          }
          return;
        },
        transform(code, id) {
          if (id === resolve(root, "src/registry.ts"))
            return { code: liveRegistry(code), map: null };
          return;
        },
        generateBundle(_options, bundle) {
          for (const chunk of Object.values(bundle)) {
            if (
              chunk.type !== "chunk" ||
              !chunk.facadeModuleId ||
              !chunk.isEntry
            )
              continue;
            const id = chunk.facadeModuleId.replace("\0production-react:", "");
            modules.set(id, { file: chunk.fileName, exports: chunk.exports });
          }
        },
      },
    ],
    build: {
      outDir,
      emptyOutDir: true,
      sourcemap: true,
      rolldownOptions: { input: entries, preserveEntrySignatures: "strict" },
    },
  });
  for (const [specifier, id] of aliases) {
    const compiled = modules.get(id);
    if (!compiled)
      throw new Error(`Shared playground module was not emitted: ${specifier}`);
    modules.set(specifier, compiled);
  }
  server.config.logger.info(
    `\nCompiled playground shell: ${outDir}\nPage source and styles remain live; restart to rebuild the shell.\n`,
  );
}
