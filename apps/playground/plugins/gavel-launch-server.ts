import { spawn, type ChildProcess } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

/** Where the playground reaches Gavel's launch API (`gavel launch serve`). */
export type GavelEndpoint = {
  /** The base URL of a launch server that answers. */
  url(): Promise<string>;
  /**
   * Called when a request could not reach `url()`. Returns true when asking
   * `url()` again may help: an on-demand endpoint whose server is gone starts
   * one on the next call.
   */
  unreachable(): boolean;
  /** How many servers this endpoint has started; a new one forgets the old one's preparations. */
  readonly generation: number;
  close(): Promise<void>;
};

const PROBE = "/api/launch?schema";

async function answers(url: string): Promise<boolean> {
  try {
    const response = await fetch(new URL(PROBE, url), { signal: AbortSignal.timeout(1000) });
    await response.body?.cancel();
    return response.ok;
  } catch {
    return false;
  }
}

/** A launch server someone else runs (`PLAYGROUND_GAVEL_URL`); the playground never starts or stops it. */
export function fixedGavel(url: string): GavelEndpoint {
  return { url: async () => url, unreachable: () => false, generation: 0, close: async () => undefined };
}

export type OnDemandGavelOptions = {
  /** The workspace Gavel prepares and stores runs under (`--root`, `--local-root`). */
  workspace: string;
  addr?: string;
  /** The gavel executable and any leading arguments. */
  command?: string[];
  readyTimeoutMs?: number;
  log?: (message: string) => void;
};

/**
 * Starts `gavel launch serve` over the workspace the first time the playground
 * needs it, unless a server already answers at `addr` (another playground's, or
 * one started by hand), and stops the one it started on close.
 */
export function onDemandGavel({
  workspace,
  addr = "127.0.0.1:9330",
  command = ["gavel"],
  readyTimeoutMs = 30_000,
  log = (message) => console.info(`[playground] ${message}`),
}: OnDemandGavelOptions): GavelEndpoint {
  const url = `http://${addr}`;
  const [bin, ...leading] = command;
  if (!bin) throw new Error("onDemandGavel needs a gavel command");
  let child: ChildProcess | undefined;
  let ready: Promise<string> | undefined;
  let generation = 0;
  const alive = (proc: ChildProcess | undefined) => !!proc && proc.exitCode === null && proc.signalCode === null;

  async function start(): Promise<string> {
    if (await answers(url)) return url;
    const proc = spawn(bin!, [...leading, "launch", "serve", "--root", workspace, "--local-root", workspace, "--addr", addr], {
      cwd: workspace,
      stdio: ["ignore", "ignore", "pipe"],
    });
    child = proc;
    generation++;
    let stderr = "";
    proc.stderr?.setEncoding("utf8").on("data", (chunk: string) => {
      stderr = (stderr + chunk).slice(-2000);
    });
    const failed = new Promise<never>((_, reject) => {
      proc.once("error", (error) =>
        reject(new Error(`Cannot start ${bin}: ${error.message}; install gavel or set PLAYGROUND_GAVEL_URL to a running launch server`)),
      );
      proc.once("exit", (code, signal) =>
        reject(new Error(`gavel launch serve exited (${signal ?? code}) before ${url} answered${stderr.trim() ? `: ${stderr.trim()}` : ""}`)),
      );
    });
    // A later exit is not an error of this start; the exit listener below forgets the server instead.
    failed.catch(() => undefined);
    proc.once("exit", () => {
      if (child !== proc) return;
      child = undefined;
      ready = undefined;
    });
    const poll = async () => {
      const deadline = Date.now() + readyTimeoutMs;
      while (!(await answers(url))) {
        if (!alive(proc)) return failed;
        if (Date.now() > deadline) throw new Error(`gavel launch serve did not answer at ${url} within ${readyTimeoutMs}ms`);
        await sleep(100);
      }
      return url;
    };
    try {
      await Promise.race([poll(), failed]);
    } catch (error) {
      proc.kill();
      throw error;
    }
    log(`started gavel launch serve (pid ${proc.pid}) at ${url} for ${workspace}`);
    return url;
  }

  const stopOnExit = () => child?.kill();
  process.once("exit", stopOnExit);

  return {
    url: () =>
      (ready ??= start().catch((error: unknown) => {
        ready = undefined;
        throw error;
      })),
    unreachable: () => {
      if (alive(child)) return false;
      ready = undefined;
      return true;
    },
    get generation() {
      return generation;
    },
    close: async () => {
      process.off("exit", stopOnExit);
      const proc = child;
      child = undefined;
      ready = undefined;
      if (!alive(proc)) return;
      const exited = new Promise((resolve) => proc!.once("exit", resolve));
      proc!.kill("SIGTERM");
      const stopped = await Promise.race([exited.then(() => true), sleep(5000).then(() => false)]);
      if (!stopped) {
        proc!.kill("SIGKILL");
        await exited;
      }
    },
  };
}
