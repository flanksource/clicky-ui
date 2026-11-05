import { spawn, type ChildProcess } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { checkGavelCompatibility } from "./gavel-compatibility";

/** Where the playground reaches Gavel's launch API (`gavel launch serve`). */
export type GavelEndpoint = {
  /** The launch server URL; `start: false` only reads its configured address. */
  url(options?: { start?: boolean }): Promise<string>;
  /**
   * Called when a request could not reach `url()`. Returns true when asking
   * `url()` again may help: an on-demand endpoint whose server is gone starts
   * one on the next call.
   */
  unreachable(): boolean;
  /** How many servers this endpoint has started; a new one forgets the old one's preparations. */
  readonly generation: number;
  close(): Promise<void>;
  /** Present when the playground starts the server itself; absent for a server run elsewhere. */
  readonly managed?: ManagedGavel;
};

/** The `gavel launch serve` process an on-demand endpoint owns. */
export type ManagedGavel = {
  /** The pid of the running server this endpoint started, or undefined when none is running. */
  pid(): number | undefined;
  /**
   * Stops the server this endpoint started, if any, and starts a new one (picking up a rebuilt
   * binary). Rejects with GavelOwnershipError when another process serves the address.
   */
  restart(): Promise<string>;
};

/** A server the playground did not start answers at its launch address, so it cannot restart it. */
export class GavelOwnershipError extends Error {
  constructor(url: string) {
    super(`Another process serves Gavel at ${url}; the playground did not start it, so restart it where it was started.`);
    this.name = "GavelOwnershipError";
  }
}

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
  localRoots?: string[];
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
  localRoots = [workspace],
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
    if (await answers(url)) { await checkGavelCompatibility(url); return url; }
    const proc = spawn(bin!, [...leading, "launch", "serve", "--root", workspace, ...localRoots.flatMap((path) => ["--local-root", path]), "--addr", addr], {
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
      await checkGavelCompatibility(url);
    } catch (error) {
      proc.kill();
      throw error;
    }
    log(`started gavel launch serve (pid ${proc.pid}) at ${url} for ${workspace}`);
    return url;
  }

  async function stop() {
    const proc = child;
    child = undefined;
    if (!alive(proc)) return;
    const exited = new Promise((resolve) => proc!.once("exit", resolve));
    proc!.kill("SIGTERM");
    const stopped = await Promise.race([exited.then(() => true), sleep(5000).then(() => false)]);
    if (!stopped) {
      proc!.kill("SIGKILL");
      await exited;
    }
  }

  /** Callers reach the server through `ready`, so a pending start, its failure, or a restart is shared by all of them. */
  function track(pending: Promise<string>) {
    const tracked = pending.catch((error: unknown) => {
      if (ready === tracked) ready = undefined;
      throw error;
    });
    ready = tracked;
    return tracked;
  }

  let restarting = 0;
  async function restart(): Promise<string> {
    const previous = ready;
    restarting++;
    try {
      return await track((async () => {
        // A start still in flight owns the child this restart has to stop.
        await previous?.catch(() => undefined);
        const pid = child?.pid;
        await stop();
        if (await answers(url)) throw new GavelOwnershipError(url);
        if (pid !== undefined) log(`stopped gavel launch serve (pid ${pid}) for restart`);
        return start();
      })());
    } finally {
      restarting--;
    }
  }

  const stopOnExit = () => child?.kill();
  process.once("exit", stopOnExit);

  return {
    url: (options) => options?.start === false ? Promise.resolve(url) : (ready ?? track(start())),
    unreachable: () => {
      // During a restart `ready` already resolves to the new server; dropping it would start a second one.
      if (restarting > 0) return true;
      if (alive(child)) return false;
      ready = undefined;
      return true;
    },
    get generation() {
      return generation;
    },
    managed: {
      pid: () => (alive(child) ? child!.pid : undefined),
      restart,
    },
    close: async () => {
      process.off("exit", stopOnExit);
      ready = undefined;
      await stop();
    },
  };
}
