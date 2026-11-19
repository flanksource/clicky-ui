import { basename, dirname, resolve } from "node:path";
import { rolldown, type PluginContext } from "rolldown";

const workerURL = /(new\s+(?:Worker|SharedWorker)\s*\(\s*)new URL\(\s*(['"])([^'":?#]+)\2\s*,\s*import\.meta\.url\s*\)/g;

export async function bundleWorkerURLs(options: { code: string; id: string; context: PluginContext; workers: Map<string, Promise<string>>; trackInput: (path: string, code: string) => void }): Promise<string> {
  const matches = [...options.code.matchAll(workerURL)].filter(match => !match[3]!.startsWith("/"));
  const replacements = await Promise.all(matches.map(async match => {
    const path = resolve(dirname(options.id), match[3]!);
    let pending = options.workers.get(path);
    if (!pending) {
      pending = compileWorker(path, options.trackInput).then(source => options.context.emitFile({ type: "asset", name: basename(path), source }));
      options.workers.set(path, pending);
    }
    return match[1] + `new URL(import.meta.ROLLUP_FILE_URL_${await pending})`;
  }));
  let code = options.code;
  for (let index = matches.length - 1; index >= 0; index--) {
    const match = matches[index]!;
    code = code.slice(0, match.index) + replacements[index] + code.slice(match.index + match[0].length);
  }
  return code;
}

async function compileWorker(path: string, trackInput: (path: string, code: string) => void): Promise<string> {
  const worker = await rolldown({
    input: path,
    platform: "browser",
    plugins: [{ name: "worker-inputs", transform(code, id) { if (!id.startsWith("\0")) trackInput(id, code); } }],
    onLog(level, log, handler) {
      if (log.code === "UNRESOLVED_IMPORT") throw new Error(log.message);
      handler(level, log);
    },
  });
  try {
    const { output } = await worker.generate({ format: "esm", codeSplitting: false, minify: true });
    const chunk = output[0];
    if (output.length !== 1 || chunk?.type !== "chunk" || chunk.imports.length || chunk.dynamicImports.length) throw new Error(`Worker ${path} must compile to one browser script`);
    return chunk.code;
  } finally { await worker.close(); }
}
