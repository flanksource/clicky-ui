import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";

if (!process.argv[2]) throw new Error("Usage: server.ts /absolute/checkout [port]");
const directory = resolve(process.argv[2]);
const port = Number(process.argv[3] ?? 8790);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Port must be an integer from 1 to 65535");
const server = createServer((request, response) => {
  void (async () => {
    response.setHeader("access-control-allow-origin", "*");
    response.setHeader("cache-control", "no-store");
    const path = resolve(directory, "." + decodeURIComponent(new URL(request.url!, "http://localhost").pathname));
    if (!path.startsWith(directory + sep)) { response.statusCode = 403; response.end("Outside checkout"); return; }
    response.end(await readFile(path));
  })().catch((error: unknown) => { response.statusCode = error instanceof Error && "code" in error && error.code === "ENOENT" ? 404 : 500; response.end(String(error)); });
});
server.listen(port, "127.0.0.1", () => process.stdout.write(`CORS checkout: http://127.0.0.1:${port}/ (${directory})\n`));
