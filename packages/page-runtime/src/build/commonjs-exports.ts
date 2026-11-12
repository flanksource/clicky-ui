import { Worker } from "node:worker_threads";

export type CommonJsExports = Record<string, { names?: string[]; error?: string }>;

export async function commonJsExportNames(paths: string[]): Promise<CommonJsExports> {
  if (!paths.length) return {};
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./cjs-export-names.mjs", import.meta.url), { workerData: paths, env: { ...process.env, NODE_ENV: "development" }, stdout: true, stderr: true });
    worker.stdout.resume();
    worker.stderr.resume();
    const timeout = setTimeout(() => { reject(new Error("Timed out enumerating CommonJS runtime exports")); void worker.terminate(); }, 30_000);
    let result: CommonJsExports | undefined;
    worker.once("message", (message: CommonJsExports) => { result = message; });
    worker.once("error", reject);
    worker.once("exit", code => {
      clearTimeout(timeout);
      if (code !== 0 || !result) { reject(new Error(`CommonJS export worker exited with code ${code} before returning exports`)); return; }
      for (const path of paths) {
        if (!result[path]?.names || result[path]?.error) { reject(new Error(`Cannot enumerate CommonJS exports of ${path}: ${result[path]?.error}`)); return; }
      }
      resolve(result);
    });
  });
}
