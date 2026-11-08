import { spawn } from "node:child_process";
import { createPublication, type Publication } from "./publish.ts";
import { withPackageLock } from "./lock.ts";

export async function runPackageBuild(options: { libraryDir: string; command: string; args: string[] }): Promise<Publication> {
  return withPackageLock({ libraryDir: options.libraryDir, run: async () => {
    await new Promise<void>((done, fail) => {
      const child = spawn(options.command, options.args, { cwd: options.libraryDir, stdio: "inherit", detached: process.platform !== "win32" });
      const signal = (value: NodeJS.Signals) => {
        if (process.platform === "win32") { child.kill(value); return; }
        if (child.pid) {
          try { process.kill(-child.pid, value); }
          catch (error) { if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error; }
        }
      };
      const term = () => signal("SIGTERM");
      const int = () => signal("SIGINT");
      process.once("SIGTERM", term); process.once("SIGINT", int);
      child.once("error", fail);
      child.once("close", (code, signal) => {
        process.off("SIGTERM", term); process.off("SIGINT", int);
        if (code === 0) done(); else fail(new Error(`Package build failed: ${signal ?? code}`));
      });
    });
    return createPublication({ libraryDir: options.libraryDir });
  } });
}
