import { readFileSync, realpathSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { resolve, relative, sep } from "node:path";
import type { Fragment } from "../schema.ts";
import { ClosureTracer, packageName } from "../build/trace.ts";
import { convertCommonJs } from "../build/convert-commonjs.ts";
import { fragmentOf } from "../build/fragment.ts";
import { assertTrace } from "../build/library-runtime.ts";
import { sourceHash } from "../sw/source-hash.ts";
import { validateSourcePath } from "../host/validation.ts";
import type { CommonJsSource } from "./types.ts";

export type CommonJsSourcesOptions = { libraryDir: string; outDir: string; runtimePath: string; paths: string[]; base: Fragment };

/** Library-source CommonJS uses the same converter and evaluated named exports as published runtime sets. */
export async function prepareCommonJsSources(options: CommonJsSourcesOptions): Promise<{ fragment: Fragment; commonjs: Record<string, CommonJsSource>; files: Record<string, string> }> {
  const root = realpathSync(options.libraryDir);
  const manifest = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")) as { name: string; version: string };
  if (!manifest.name || !manifest.version) throw new Error("CommonJS library requires name and version");
  validateSourcePath(options.runtimePath);
  const entries = options.paths.map((path) => {
    validateSourcePath(path);
    const absolute = realpathSync(resolve(root, path));
    if (relative(root, absolute).startsWith(`..${sep}`)) throw new Error(`CommonJS source ${path} escapes the library`);
    return { specifier: `${manifest.name}/${path}`, path: absolute };
  });
  const prefix = `${manifest.name}@${manifest.version}/`;
  const tracer = new ClosureTracer({ name: manifest.name, resolveFrom: root, runtimeBase: `${prefix}${options.runtimePath}/`, entries, topLevel: [], inherits: [...new Set(Object.keys(options.base.imports).map(packageName))].filter((name) => name !== manifest.name) }).trace();
  assertTrace(tracer);
  await mkdir(options.outDir, { recursive: true });
  await convertCommonJs(tracer, options.outDir);
  assertTrace(tracer);
  const commonjs = Object.fromEntries(options.paths.map((path) => {
    const target = tracer.imports[`${manifest.name}/${path}`];
    if (!target?.startsWith(`${prefix}${options.runtimePath}/`)) throw new Error(`${path} was not converted from CommonJS`);
    return [path, { hash: sourceHash(readFileSync(resolve(root, path), "utf8")), target: target.slice(prefix.length) }];
  }));
  return { fragment: fragmentOf(tracer), commonjs, files: Object.fromEntries([...tracer.files.values()].filter((file) => file.url.startsWith(`${prefix}${options.runtimePath}/`)).map((file) => [file.url.slice(prefix.length), file.path])) };
}
