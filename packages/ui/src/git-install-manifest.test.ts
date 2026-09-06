import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const packageJson = JSON.parse(
  readFileSync(resolve(process.cwd(), "package.json"), "utf8"),
) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
};

describe("git installation manifest", () => {
  it("uses portable dependencies and builds the package during installation", () => {
    const dependencySpecs = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    expect({
      workspaceOnlyDependencies: Object.entries(dependencySpecs).filter(
        ([, version]) => version.startsWith("catalog:") || version.startsWith("workspace:"),
      ),
      prepare: packageJson.scripts?.prepare,
    }).toEqual({
      workspaceOnlyDependencies: [],
      prepare: "pnpm run build",
    });
  });
});
