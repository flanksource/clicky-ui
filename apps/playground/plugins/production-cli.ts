import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { startProductionServer } from "./production-node";

const { values } = parseArgs({ options: { port: { type: "string", default: "5275" }, host: { type: "string", default: "localhost" } } });
const port = Number(values.port);
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error("--port must be between 0 and 65535");
if (!["localhost", "127.0.0.1", "::1"].includes(values.host)) throw new Error("Browser playground requires a loopback host for same-origin-local frames");
const server = await startProductionServer({ root: resolve(dirname(fileURLToPath(import.meta.url)), ".."), port, host: values.host });
process.stdout.write(`Browser-only playground: ${server.origin}\n`);
for (const signal of ["SIGINT", "SIGTERM"] as const) process.once(signal, () => { void server.close().catch(error => { process.stderr.write(String(error) + "\n"); process.exitCode = 1; }); });
