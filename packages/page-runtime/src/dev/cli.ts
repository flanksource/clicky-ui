import type { PackageOriginOptions } from "./index.ts";

export function parsePackageArguments(args: string[]): PackageOriginOptions & { port: number } {
  const options = { packages: [] as string[], upstreamRegistry: "https://registry.npmjs.org", upstreamOrigin: "https://unpkg.com", port: 5812, stateDir: ".tmp/package-origin" };
  const seen = new Set<string>();
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index]!;
    const value = args[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`${flag}: missing value`);
    if (flag !== "--package" && seen.has(flag)) throw new Error(`${flag}: specified more than once`);
    seen.add(flag);
    switch (flag) {
      case "--package": options.packages.push(value); break;
      case "--upstream-registry": options.upstreamRegistry = value; break;
      case "--upstream-origin": options.upstreamOrigin = value; break;
      case "--state-dir": options.stateDir = value; break;
      case "--port":
        if (!/^\d+$/.test(value) || Number(value) > 65535) throw new Error(`Invalid port: ${value}`);
        options.port = Number(value); break;
      default: throw new Error(`Unknown option: ${flag}`);
    }
  }
  if (!options.packages.length) throw new Error("Specify --package <dir> at least once");
  return options;
}
