import { describe, expect, it } from "vitest";
import { compileLinkModule } from "../sw/link-compiler.ts";
import { exampleLink, exampleLock } from "./testing-fixtures.ts";
import { pageSourcePath, pageSourceModule, validatePageSources } from "./page-sources.ts";
import { linksInLock, composeLinkOverrides } from "./overrides.ts";
import { sourceHash } from "../sw/source-hash.ts";
import { isPageSource } from "../host/agent-source.ts";

const roots = [{ link: "pages", root: "src/pages", prefix: "", editable: true }];

describe("declared page source links", () => {
  it("keeps declared links in the lock and resolves the page entry without host snapshots", () => {
    const link = exampleLink(); link.id = "pages";
    link.build.pageSources = [{ root: "src/pages", prefix: "", editable: true }];
    const lock = composeLinkOverrides({ lock: exampleLock(), links: [link], profile: { links: "allow" }, developerOverrides: true });
    expect(lock.pageSources).toEqual(roots);
    expect(linksInLock({ ...exampleLock(), pageSources: roots })).toEqual(["pages"]);
    expect(pageSourceModule({ page: "reports/revenue.tsx", roots })).toBe("/link/pages/src/pages/reports/revenue.tsx");
  });
  it("projects only declared writable page roots to normalized relative paths", () => {
    expect(pageSourcePath({ path: "/link/pages/src/pages/reports/revenue.tsx", roots })).toBe("reports/revenue.tsx");
    expect(pageSourcePath({ path: "/link/pages/src/library.tsx", roots })).toBeUndefined();
    expect(pageSourcePath({ path: "/link/library/src/pages/report.tsx", roots })).toBeUndefined();
    expect(pageSourcePath({ path: "/link/pages/src/pages/report.tsx", roots: [{ ...roots[0]!, editable: false }] })).toBeUndefined();
  });
  it.each(["../pages", "src/../pages", "src//pages", "src\\pages", "src/%2e%2e/pages"])("rejects unsafe roots %s", (root) => {
    expect(() => validatePageSources([{ ...roots[0]!, root }])).toThrow();
  });
  it("rejects overlapping projections and library or runtime destinations", () => {
    expect(() => validatePageSources([...roots, { link: "other", root: "src/pages", prefix: "", editable: true }])).toThrow(/overlap/);
    for (const prefix of ["npm", "link", "__runtime", "packages/ui"]) expect(() => validatePageSources([{ ...roots[0]!, prefix }])).toThrow();
    for (const root of ["node_modules/acme", "packages/ui/src", "packages/facet/src", "__runtime"]) expect(() => validatePageSources([{ ...roots[0]!, root }])).toThrow();
  });
  it("compiles markers from original bytes using declared page provenance", async () => {
    const link = exampleLink(); link.id = "pages";
    const code = 'export default () => <rect width={10} />;\r\n';
    link.build.modules = { "src/pages/reports/revenue.tsx": { resolutions: {} } };
    Object.assign(link.build, { pageSources: [{ root: "src/pages", prefix: "", editable: true }] });
    const lock = Object.assign(exampleLock(), { pageSources: roots });
    lock.map.imports["react/jsx-dev-runtime"] = "/npm/react@18/jsx-dev-runtime.js";
    lock.integrity["react@18/jsx-dev-runtime.js"] = "test";
    const output = await compileLinkModule({ path: "/link/pages/src/pages/reports/revenue.tsx", code, lock, links: [link], sources: [], query: new URLSearchParams(), plugins: {} as never });
    expect(output.match(/reports\/revenue\.tsx:\d+:\d+#\d+@[a-f0-9]+/g)).toContain(`reports/revenue.tsx:1:22#0@${sourceHash(code)}`);
    expect(output).not.toContain('"data-source": "/link/');
    expect(isPageSource(`reports/revenue.tsx:1:22#0@${sourceHash(code)}`)).toBe(true);
    expect(isPageSource(`/link/library/src/Button.tsx:1:1#0@${sourceHash(code)}`)).toBe(false);
  });
  it("refuses lock provenance absent from the installed link declaration", async () => {
    const link = exampleLink(); link.id = "pages";
    await expect(compileLinkModule({ path: "/link/pages/src/pages/report.tsx", code: "export default () => <h1 />", lock: Object.assign(exampleLock(), { pageSources: roots }), links: [link], sources: [], query: new URLSearchParams(), plugins: {} as never })).rejects.toThrow(/declaration/);
  });
});
