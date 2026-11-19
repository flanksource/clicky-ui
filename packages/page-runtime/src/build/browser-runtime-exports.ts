import { join } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { BASE_PACKAGES } from "./base.ts";
import { convertCommonJs } from "./convert-commonjs.ts";
import { CommonJsConversionError, NodeBuiltinError } from "./errors.ts";
import { fragmentOf } from "./fragment.ts";
import { assertTrace } from "./library-runtime.ts";
import { type RuntimeExport } from "./runtime-layer.ts";
import { ClosureTracer, EMPTY_MODULE, packageName } from "./trace.ts";

export async function buildBrowserRuntimeExports(options: { root: string; entries: Record<string, RuntimeExport>; outDir: string; runtimeBase: string; inherited: string[] }) {
  const { root, entries, outDir, runtimeBase, inherited } = options;
  const inherits = [...new Set([...BASE_PACKAGES, ...inherited])];
  const candidates = Object.entries(entries).map(([specifier, entry]) => ({ specifier, path: entry.browser }));
  function trace(selected: typeof candidates) {
    return new ClosureTracer({ name: "Facet template runtime", resolveFrom: root, runtimeBase, entries: selected, topLevel: [], inherits }).trace();
  }
  const verify = async (selected: typeof candidates) => {
    const tracer = trace(selected);
    assertTrace(tracer);
    try { await convertCommonJs(tracer, outDir); }
    catch (error) { assertTrace(tracer); throw error; }
    assertTrace(tracer);
    return tracer;
  };
  const selectBrowser = async (selected: typeof candidates): Promise<typeof candidates> => {
    try { await verify(selected); return selected; }
    catch (error) {
      if (!(error instanceof NodeBuiltinError) && !(error instanceof CommonJsConversionError)) throw error;
      if (selected.length <= 1) return [];
      const middle = Math.floor(selected.length / 2);
      return [...await selectBrowser(selected.slice(0, middle)), ...await selectBrowser(selected.slice(middle))];
    }
  };
  let tracer: ClosureTracer;
  try { tracer = await verify(candidates); }
  catch (error) {
    if (!(error instanceof NodeBuiltinError) && !(error instanceof CommonJsConversionError)) throw error;
    const middle = Math.floor(candidates.length / 2);
    const selected = candidates.length <= 1 ? [] : [...await selectBrowser(candidates.slice(0, middle)), ...await selectBrowser(candidates.slice(middle))];
    tracer = await verify(selected);
  }
  const fragment = fragmentOf(tracer);
  if (fragment.integrity[`${runtimeBase}empty.js`]) {
    await mkdir(outDir, { recursive: true });
    const path = join(outDir, "empty.js");
    await writeFile(path, EMPTY_MODULE);
    tracer.files.get(`${runtimeBase}empty.js`)!.path = path;
  }
  const versions = Object.fromEntries(Object.keys(fragment.imports).map(specifier => [packageName(specifier), entries[specifier]!.version]));
  return { fragment, versions, packages: Object.fromEntries(tracer.packages), files: Object.fromEntries([...tracer.files].map(([url, file]) => [url, file.path])) };
}
