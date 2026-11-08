import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";
import { buildLinkRuntime } from "./build.ts";

it("retains built and source export indexes while preparing linked CommonJS", async () => {
  const parent = fileURLToPath(new URL("../../../../.tmp/T-host-e2e/", import.meta.url));
  await mkdir(parent, { recursive: true });
  const libraryDir = await mkdtemp(join(parent, "barrel-build-"));
  try {
    await mkdir(join(libraryDir, "dist")); await mkdir(join(libraryDir, "src"));
    await writeFile(join(libraryDir, "package.json"), JSON.stringify({ name: "@acme/ui", version: "1.0.0", type: "module", sideEffects: false, exports: { ".": "./dist/index.js", "./comments": "./dist/comments.js" } }));
    await writeFile(join(libraryDir, "dist/index.js"), 'export const Counter = 1;');
    await writeFile(join(libraryDir, "dist/comments.js"), 'export { CommentProvider } from "./provider.js";');
    await writeFile(join(libraryDir, "dist/provider.js"), 'export const CommentProvider = 1;');
    await writeFile(join(libraryDir, "src/index.ts"), 'export const Counter = 2; export { value } from "./choice.cjs";');
    await writeFile(join(libraryDir, "src/choice.cjs"), 'module.exports = { value: "source-commonjs" };');
    const result = await buildLinkRuntime({ libraryDir, outDir: join(libraryDir, "dist/runtime"), entries: { "@acme/ui": "src/index.ts" }, defines: {} });
    const entry = result.barrels.barrels["dist/comments.js"]?.CommentProvider;
    if (typeof entry !== "number") throw new Error("Built CommentProvider export is absent from link metadata");
    expect({ target: result.barrels.modules[entry], source: result.entries["@acme/ui"] }).toEqual({ target: "dist/provider.js", source: "src/index.ts" });
    expect(result.commonjs?.["src/choice.cjs"]?.target).toContain("dist/runtime/source-commonjs/");
  } finally { await rm(libraryDir, { recursive: true, force: true }); }
});
