import { expect, it } from "vitest";
import { renderLibraryKey } from "./render-job.ts";
import type { PageLock } from "../schema.ts";

const library: PageLock = {
  lock: 2,
  page: "report-a/index.tsx",
  packageOrigin: "http://localhost:3010/packages",
  versions: { react: "19.0.0" },
  map: { imports: { react: "/react.js" }, scopes: {} },
  integrity: { "react.js": "first-release" },
  remaps: {},
  barrels: { modules: [], barrels: {} },
};

it("shares an import map across entries and opens a new realm when package bytes change", () => {
  const next = { ...library, page: "report-b/index.mdx" };
  expect(renderLibraryKey(library)).toBe(renderLibraryKey(next));
  expect(renderLibraryKey({ ...next, integrity: { "react.js": "second-release" } })).not.toBe(renderLibraryKey(library));
});
