import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { expect, test } from "vitest";

const run = promisify(execFile);
test.each([false, true])("updates the builder manifest and CI outputs (first publish=%s)", async first => {
  await mkdir(".tmp", { recursive: true });
  const root = await mkdtemp(resolve(".tmp/release-version-"));
  const name = "@example/runtime-builder";
  const registry = createServer((_request, response) => {
    response.setHeader("content-type", "application/json");
    response.statusCode = first ? 404 : 200;
    response.end(JSON.stringify(first ? { error: "Not found" } : { name, "dist-tags": { latest: "0.1.4" }, versions: { "0.1.3": { name, version: "0.1.3" }, "0.1.4": { name, version: "0.1.4" } } }));
  });
  try {
    await new Promise<void>(done => registry.listen(0, "127.0.0.1", done));
    const address = registry.address();
    if (!address || typeof address === "string") throw new Error("Test registry did not bind a TCP port");
    const manifest = join(root, "builder-package.json");
    const output = join(root, "github-output");
    const userConfig = join(root, "npmrc");
    const original = { name, version: "0.1.0", dependencies: { "example-dependency": "1.0.0" } };
    await writeFile(manifest, JSON.stringify(original));
    await writeFile(userConfig, "");
    await run(process.execPath, ["--import", createRequire(import.meta.url).resolve("tsx"), fileURLToPath(new URL("./release-version.ts", import.meta.url)), manifest, "page-runtime-build"], {
      cwd: root,
      env: { ...process.env, GITHUB_OUTPUT: output, npm_config_userconfig: userConfig, npm_config_registry: `http://127.0.0.1:${address.port}`, npm_config_update_notifier: "false" },
    });
    const version = first ? "0.1.0" : "0.1.5";
    expect({ manifest: JSON.parse(await readFile(manifest, "utf8")), output: await readFile(output, "utf8") }).toEqual({ manifest: { ...original, version }, output: `version=${version}\ntag=page-runtime-build@${version}\n` });
  } finally {
    await new Promise<void>(done => registry.close(() => done()));
    await rm(root, { recursive: true, force: true });
  }
}, 30_000);
