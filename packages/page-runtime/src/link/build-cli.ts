import { readFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { parseArgs } from "node:util";
import type { Fragment } from "../schema.ts";
import type { LinkBuild } from "./types.ts";
import { buildLinkRuntime } from "./build.ts";

const { values } = parseArgs({ options: { library: { type: "string" }, entries: { type: "string" }, defines: { type: "string" }, base: { type: "string" } } });
if (!values.library || !values.entries || !values.defines) throw new Error("Usage: build-cli.ts --library /checkout --entries /entrypoints.json --defines /build-inputs.json [--base /base/importmap.json]");
const libraryDir = resolve(values.library);
const result = await buildLinkRuntime({ libraryDir, outDir: join(libraryDir, "dist/runtime"), entries: JSON.parse(await readFile(resolve(values.entries), "utf8")) as Record<string, string>, defines: JSON.parse(await readFile(resolve(values.defines), "utf8")) as LinkBuild["defines"], ...(values.base ? { base: JSON.parse(await readFile(resolve(values.base), "utf8")) as Fragment } : {}) });
process.stdout.write(`Built ${result.library}@${result.version}: ${Object.keys(result.modules).length} source modules; ${join(libraryDir, "dist/runtime/link.json")}\n`);
