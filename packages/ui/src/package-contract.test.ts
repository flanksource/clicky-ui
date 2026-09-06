import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

type PackageManifest = {
  scripts?: Record<string, string>;
};

describe("package contract", () => {
  it("builds distributable exports before packing a Git dependency", () => {
    const manifest = JSON.parse(
      readFileSync(resolve(process.cwd(), "package.json"), "utf8"),
    ) as PackageManifest;

    expect(manifest.scripts?.prepack).toBe("pnpm run build");
  });
});
