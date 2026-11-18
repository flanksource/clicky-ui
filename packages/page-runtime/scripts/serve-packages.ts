import { parsePackageArguments } from "../src/dev/cli.ts";
import { servePackages } from "../src/dev/index.ts";

const local = await servePackages(parsePackageArguments(process.argv.slice(2)));
process.stdout.write(`Local package registry and origin: ${local.origin}\n`);
for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => {
  void local.close().catch((error: unknown) => { process.stderr.write(`${String(error)}\n`); process.exitCode = 1; });
});
