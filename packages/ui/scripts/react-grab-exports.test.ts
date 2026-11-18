import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";

it("ships the picker as Clicky UI subpaths without a separate package", () => {
  const root = resolve(import.meta.dirname, "..");
  const manifest = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
  expect(Object.fromEntries(Object.entries(manifest.exports).filter(([key]) => key.startsWith("./react-grab")))).toEqual({
    "./react-grab": { types: "./dist/react-grab/index.d.ts", import: "./dist/react-grab/index.js" },
    "./react-grab/core": { types: "./dist/react-grab/core/index.d.ts", import: "./dist/react-grab/core/index.js" },
    "./react-grab/primitives": { types: "./dist/react-grab/primitives.d.ts", import: "./dist/react-grab/primitives.js" },
    "./react-grab/styles.css": "./dist/react-grab/styles.css",
  });
  expect(existsSync(resolve(root, "react-grab/package.json"))).toBe(false);
  expect(existsSync(resolve(root, "../react-grab/package.json"))).toBe(false);
});
