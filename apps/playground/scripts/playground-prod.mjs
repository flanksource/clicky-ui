import { spawnSync } from "node:child_process";
import { parseArgs } from "node:util";

process.env.NODE_ENV = "production";

const { values } = parseArgs({
  options: { port: { type: "string" }, host: { type: "string" } },
});
const port = values.port === undefined ? undefined : Number(values.port);
if (
  port !== undefined &&
  (!Number.isInteger(port) || port < 1 || port > 65535)
) {
  throw new Error("--port must be an integer between 1 and 65535");
}

const icons = spawnSync(
  "pnpm",
  ["--filter", "@flanksource/clicky-ui", "build:icons"],
  { stdio: "inherit" },
);
if (icons.error) throw icons.error;
if (icons.status !== 0) process.exit(icons.status ?? 1);

const { createServer } = await import("vite");
const server = await createServer({
  mode: "playground-prod",
  server: {
    ...(port !== undefined ? { port } : {}),
    ...(values.host ? { host: values.host } : {}),
  },
});
await server.listen();
server.printUrls();

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    await server.close();
    process.exit(0);
  });
}
