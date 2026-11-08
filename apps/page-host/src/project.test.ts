import { describe, expect, it } from "vitest";
import type { PageLock } from "@flanksource/page-runtime/schema";
import { manifestOf, overrideVersions, parseProject, persistableLocks, sourceTree, type Project } from "./project";

const lock = (page: string): PageLock => ({ lock: 2, packageOrigin: "https://packages.example", page, versions: {}, map: { imports: {}, scopes: {} }, integrity: {}, remaps: {}, barrels: { modules: [], barrels: {} } });
const project: Project = {
  format: 1, name: "Reports", entry: "reports/q3.tsx",
  files: { "package.json": JSON.stringify({ dependencies: { "@flanksource/clicky-ui": "^0.3.50", "@flanksource/facet": "^0.1.74" }, pageRuntime: { pages: { "other.tsx": { "@flanksource/clicky-ui": "0.3.40" } } } }), "reports/q3.tsx": "export default () => <p>Q3</p>", "other.tsx": "export default () => <p>Other</p>" },
  locks: { "reports/q3.tsx": lock("reports/q3.tsx"), "other.tsx": lock("other.tsx") },
};

describe("project", () => {
  it("invalidates obsolete persisted locks while keeping source and current locks", () => {
    expect(parseProject({ ...project, locks: { ...project.locks, [project.entry]: { ...lock(project.entry), lock: 1 } } })).toEqual({ ...project, locks: { "other.tsx": lock("other.tsx") } });
  });
  it("does not persist a lock resolved from unsaved library versions", () => {
    expect(persistableLocks({ project, savedFiles: { ...project.files, "package.json": '{"dependencies":{}}' } })).toBeNull();
  });
  it("does not persist locks for unsaved new pages", () => {
    const { "other.tsx": _removed, ...savedFiles } = project.files;
    expect(persistableLocks({ project, savedFiles })).toEqual({ [project.entry]: lock(project.entry) });
  });
  it("round trips sources and per-page locks", () => {
    expect(parseProject(JSON.parse(JSON.stringify(project)))).toEqual(project);
  });
  it.each(["../secret.tsx", "/absolute.tsx", "folder//page.tsx", "folder\\page.tsx"])("rejects unsafe source path %s", (path) => {
    expect(() => parseProject({ ...project, files: { ...project.files, [path]: "secret" } })).toThrow(/path/);
  });
  it("rejects a missing page and a malformed manifest", () => {
    expect(() => parseProject({ ...project, entry: "absent.tsx" })).toThrow(/absent/);
    expect(() => manifestOf({ "package.json": '{"dependencies":[]}' })).toThrow(/dependencies/);
    expect(() => manifestOf({})).toThrow(/package.json/);
  });
  it("writes only the selected page override and invalidates only its lock", () => {
    const updated = overrideVersions({ project, page: project.entry, versions: { "@flanksource/clicky-ui": "0.3.41", "@flanksource/facet": "0.1.74" } });
    expect(manifestOf(updated.files)).toEqual({ dependencies: { "@flanksource/clicky-ui": "^0.3.50", "@flanksource/facet": "^0.1.74" }, pageRuntime: { pages: { "other.tsx": { "@flanksource/clicky-ui": "0.3.40" }, "reports/q3.tsx": { "@flanksource/clicky-ui": "0.3.41", "@flanksource/facet": "0.1.74" } } } });
    expect(updated.locks).toEqual({ "other.tsx": lock("other.tsx") });
    expect(project.locks[project.entry]).toBeDefined();
  });
  it("rejects React overrides because React follows clicky-ui", () => {
    expect(() => overrideVersions({ project, page: project.entry, versions: { react: "19.0.0" } })).toThrow(/managed library/);
  });
  it("preserves other per-page packages and native manifest metadata", () => {
    const native = { private: true, scripts: { example: "example" }, dependencies: { "@flanksource/clicky-ui": "^0.3" }, pageRuntime: { pages: { [project.entry]: { "date-fns": "4.1.0" } } } };
    const updated = overrideVersions({ project: { ...project, files: { ...project.files, "package.json": JSON.stringify(native) } }, page: project.entry, versions: { "@flanksource/clicky-ui": "0.3.41" } });
    expect(JSON.parse(updated.files["package.json"]!)).toEqual({ ...native, pageRuntime: { pages: { [project.entry]: { "date-fns": "4.1.0", "@flanksource/clicky-ui": "0.3.41" } } } });
  });
  it("builds a sorted hierarchical source tree", () => {
    expect(sourceTree({ "z.tsx": "", "reports/q3.tsx": "", "reports/q1.tsx": "" })).toEqual([
      { name: "reports", path: "reports", children: [{ name: "q1.tsx", path: "reports/q1.tsx" }, { name: "q3.tsx", path: "reports/q3.tsx" }] },
      { name: "z.tsx", path: "z.tsx" },
    ]);
  });
});
