import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build, type Plugin } from "rolldown";
import { frameDocument } from "../src/sw/router.ts";
import { findLocalWorkspaces, localWorkspacesPlugin } from "./local-workspaces.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = resolve(root, "../..");
/** `dev`: bundle `@flanksource/*` dependencies from sibling checkouts of this workspace instead of the installed releases. */
export type BuildStaticOptions = { outDir?: string; version?: string; dev?: boolean };
/** Rolldown only warns on an unresolved import and leaves a guessed global behind; a runtime bundle must fail instead. */
const failOnUnresolved = { onLog(level: "info" | "debug" | "warn", log: { code?: string; message: string }, handler: (level: "info" | "debug" | "warn" | "error", log: { code?: string; message: string }) => void) { if (log.code === "UNRESOLVED_IMPORT") throw new Error(`build-static: ${log.message}; publish the missing export or build with --dev against a local checkout`); handler(level, log); } };
type Manifest = { version: string; dependencies?: Record<string, string>; devDependencies?: Record<string, string> };

/** The local checkouts `--dev` uses: every `@flanksource/*` dependency not already provided by this workspace. */
async function devPlugins(pkg: Manifest): Promise<Plugin[]> {
  const external = Object.entries({ ...pkg.dependencies, ...pkg.devDependencies }).filter(([name, range]) => name.startsWith("@flanksource/") && !range.startsWith("workspace:")).map(([name]) => name);
  const workspaces = findLocalWorkspaces({ workspaceRoot, names: external });
  for (const name of external) console.log(workspaces.has(name) ? `--dev: ${name} → ${workspaces.get(name)}` : `--dev: ${name} has no local checkout; using the installed release`);
  return [localWorkspacesPlugin(workspaces)];
}

export async function buildStatic(options: BuildStaticOptions = {}): Promise<void> {
  const outDir = options.outDir ?? resolve(root, "dist/static");
  const pkg = JSON.parse(await readFile(resolve(root, "package.json"), "utf8")) as Manifest;
  const plugins = options.dev ? await devPlugins(pkg) : [];
  await mkdir(outDir, { recursive: true });
  await build({
    ...failOnUnresolved,
    input: resolve(root, "src/sw/worker.ts"),
    plugins,
    resolve: { conditionNames: ["worker", "browser", "import", "default"] },
    platform: "browser",
    transform: { define: { __RUNTIME_VERSION__: JSON.stringify(options.version ?? pkg.version), "process.env.NODE_ENV": JSON.stringify("development"), "process.env": "{}" } },
    output: { file: resolve(outDir, "sw.js"), format: "iife", sourcemap: true, codeSplitting: false },
  });
  await build({
    ...failOnUnresolved,
    input: resolve(root, "src/frame/entry.ts"),
    plugins,
    external: ["./page-agent.js", "react", "react-dom", "react-dom/client"],
    platform: "browser",
    transform: { define: { "process.env.NODE_ENV": JSON.stringify("development") } },
    output: { file: resolve(outDir, "boot.js"), format: "es", sourcemap: true, codeSplitting: false },
  });
  await build({
    ...failOnUnresolved,
    input: resolve(root, "src/frame/page-agent.ts"),
    plugins,
    external: ["react", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime", "@flanksource/clicky-ui/comments"],
    platform: "browser",
    transform: { jsx: { runtime: "automatic", development: true }, define: { "process.env.NODE_ENV": JSON.stringify("development") } },
    output: { file: resolve(outDir, "page-agent.js"), format: "es", sourcemap: true, codeSplitting: false },
  });
  await build({ ...failOnUnresolved, input: resolve(root, "src/frame/devtools-hook.ts"), plugins, platform: "browser", transform: { define: { "process.env.NODE_ENV": JSON.stringify("development") } }, output: { file: resolve(outDir, "devtools-hook.js"), format: "iife" } });
  await writeFile(resolve(outDir, "bootstrap.html"), frameDocument().html);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const unknown = process.argv.slice(2).filter(arg => arg !== "--dev");
  if (unknown.length) throw new Error(`build-static: unknown arguments ${unknown.join(" ")}; the only flag is --dev`);
  await buildStatic({ dev: process.argv.includes("--dev") });
}
