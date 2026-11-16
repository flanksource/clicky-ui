import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { liveRegistry, pageFiles } from "./production-registry";

describe("production playground registry", () => {
  it("keeps all four loader kinds live without bundling scratch pages", async () => {
    const source = await readFile(resolve("src/registry.ts"), "utf8");
    const result = liveRegistry(source);
    const dynamicImports = (code: string) => code.split("import(/* @vite-ignore */").length - 1;
    expect(result).not.toMatch(/import\.meta\.glob\s*\(/);
    for (const kind of ["component", "guidance", "markdown", "meta"]) {
      expect(result).toContain(`__liveModules("${kind}")`);
    }
    expect(result).toContain("/__playground/browser-page?");
    // The registry's own runtime-loaded vocabulary pages keep their dynamic imports; the live loaders add none.
    expect(dynamicImports(source)).toBeGreaterThan(0);
    expect(dynamicImports(result)).toBe(dynamicImports(source));
  });

  it("rejects registry changes that would accidentally bundle pages", () => {
    expect(() => liveRegistry("export const PAGES = [];")).toThrow(
      "Expected four page globs",
    );
  });

  it("discovers public pages while excluding helpers and tests", async () => {
    await mkdir(".tmp", { recursive: true });
    const root = await mkdtemp(resolve(".tmp/production-registry-"));
    try {
      await mkdir(resolve(root, "src/pages/_parts"), { recursive: true });
      await Promise.all([
        writeFile(
          resolve(root, "src/pages/welcome.tsx"),
          'import { Button } from "@flanksource/clicky-ui"; import { Provider } from "../shared"; import { Missing } from "../missing";',
        ),
        writeFile(
          resolve(root, "src/pages/_parts/helper.tsx"),
          "export const helper = true;",
        ),
        writeFile(resolve(root, "src/pages/welcome.test.tsx"), ""),
        writeFile(resolve(root, "src/pages/guide.md"), "# Guide"),
        writeFile(
          resolve(root, "src/shared.ts"),
          "export const Provider = {};",
        ),
      ]);
      expect(await pageFiles(root)).toEqual(["guide.md", "welcome.tsx"]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
