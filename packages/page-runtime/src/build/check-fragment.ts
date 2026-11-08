import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Fragment } from "../schema.ts";
import { composeImportMap, resolveSpecifier } from "./fragment.ts";
import { librarySpec } from "./library-runtime.ts";
import { specifierKind } from "./module-utils.ts";
import { traceRecipeDependencies } from "./recipe-dependencies.ts";
import { ClosureTracer, integrityOf, moduleFormat, packageName } from "./trace.ts";

export async function checkFragment(options: { libraryDir: string; base?: Fragment }): Promise<string[]> {
  const fragment = JSON.parse(readFileSync(join(options.libraryDir, "dist/runtime/importmap.json"), "utf8")) as Fragment;
  const spec = librarySpec(options);
  spec.inherits = [...new Set(fragment.inherits.map(packageName))];
  const tracer = new ClosureTracer(spec).trace();
  await traceRecipeDependencies(tracer);
  const failures = tracer.failures.map(({ name, detail }) => `${name}: ${detail}`);
  const fragments = options.base ? [options.base, fragment] : [{ ...fragment, inherits: [] }];
  const composed = composeImportMap(fragments, "/npm/");
  failures.push(...composed.failures.map(({ detail }) => detail));
  for (const file of tracer.files.values()) {
    if (file.kind === "commonjs" && fragment.remaps[file.url]) continue;
    if (fragment.integrity[file.url] !== file.integrity) failures.push(`${file.url}: missing or mismatched integrity`);
    for (const specifier of file.bareImports) {
      if (!resolveSpecifier(composed.map, specifier, `/npm/${file.url}`) && !fragment.inherits.includes(specifier)) failures.push(`${file.url}: unmapped import ${specifier}`);
    }
  }
  for (const entry of tracer.commonJs.values()) {
    if (!Object.values(fragment.imports).includes(entry.url) && !Object.values(fragment.remaps).includes(entry.url) && !Object.values(fragment.scopes).some((table) => Object.values(table).includes(entry.url))) failures.push(`${entry.specifier}: unconverted CommonJS`);
  }
  const prefix = tracer.spec.runtimeBase;
  if (!prefix) throw new Error(`${fragment.name}: missing runtime base`);
  for (const [url, integrity] of Object.entries(fragment.integrity)) {
    if (!url.startsWith(prefix)) continue;
    const path = join(options.libraryDir, "dist/runtime", url.slice(prefix.length));
    if (integrityOf(readFileSync(path)) !== integrity) failures.push(`${url}: integrity mismatch`);
    const { module } = moduleFormat(path);
    const map = composed.map;
    for (const item of module.staticImports) {
      const specifier = item.moduleRequest.value;
      if (specifierKind(specifier) === "builtin" && !resolveSpecifier(map, specifier, `/npm/${url}`)) failures.push(`${url}: Node built-in ${specifier}`);
      if (specifierKind(specifier) === "bare" && !resolveSpecifier(map, specifier, `/npm/${url}`) && !fragment.inherits.includes(specifier)) failures.push(`${url}: unmapped import ${specifier}`);
    }
  }
  return failures;
}
