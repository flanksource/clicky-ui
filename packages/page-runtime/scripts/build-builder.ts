import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "rolldown";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(await readFile(resolve(root, "package.json"), "utf8")) as { dependencies: Record<string, string>; peerDependencies: Record<string, string> };
const packages = Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies });
await rm(resolve(root, "dist/build"), { recursive: true, force: true });
await mkdir(resolve(root, "dist/build"), { recursive: true });
await build({
  input: { index: resolve(root, "src/build/index.ts"), dependencies: resolve(root, "src/build/dependencies.ts") },
  platform: "node",
  external: source => source.startsWith("node:") || packages.some(name => source === name || source.startsWith(`${name}/`)),
  output: { dir: resolve(root, "dist/build"), format: "esm", entryFileNames: "[name].mjs", chunkFileNames: "[name]-[hash].mjs", sourcemap: true },
});
await cp(resolve(root, "src/build/cjs-export-names.mjs"), resolve(root, "dist/build/cjs-export-names.mjs"));
await cp(resolve(root, "src/build/README.md"), resolve(root, "dist/build/README.md"));
const declarations = ts.createProgram([resolve(root, "src/build/index.ts"), resolve(root, "src/build/dependencies.ts")], {
  declaration: true, emitDeclarationOnly: true, allowImportingTsExtensions: true, outDir: resolve(root, "dist/build/types"), rootDir: resolve(root, "src"),
  target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, skipLibCheck: true, esModuleInterop: true, strict: true,
});
const diagnostics = ts.getPreEmitDiagnostics(declarations);
if (diagnostics.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCurrentDirectory: () => root, getCanonicalFileName: path => path, getNewLine: () => "\n" }));
declarations.emit();
await writeFile(resolve(root, "dist/build/package.json"), await readFile(resolve(root, "builder-package.json"), "utf8"));
