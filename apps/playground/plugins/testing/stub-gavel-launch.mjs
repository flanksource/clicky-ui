// A stand-in for `gavel launch serve`: answers every request with the arguments it was started with, on --addr.
// STUB_GAVEL_FAIL makes it print that message to stderr and exit 1 instead, like a failed bind.
import { createServer } from "node:http";

const args = process.argv.slice(2);
if (process.env.STUB_GAVEL_FAIL) {
  process.stderr.write(`${process.env.STUB_GAVEL_FAIL}\n`);
  process.exit(1);
}
const addr = args[args.indexOf("--addr") + 1];
if (!addr) throw new Error("stub gavel needs --addr");
const [host, port] = addr.split(":");
createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ args, cwd: process.cwd(), pid: process.pid, url: req.url }));
}).listen(Number(port), host);
