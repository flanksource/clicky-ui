// @vitest-environment node
import { describe, expect, it } from "vitest";

import { memoryGuidanceHost } from "./markdown-static-evaluator";
import { pageModuleGraph } from "./page-module-graph";

describe("pageModuleGraph", () => {
  const host = memoryGuidanceHost({
    "/pages/a/page.tsx": 'import { lazy } from "react";\nimport "./_x/static";\nexport * from "./_x/reexport";\nconst D = lazy(() => import("./_x/lazy"));\n',
    "/pages/a/_x/static.ts": 'import "./nested/index";\nimport "../../../shared/util";\nimport "./style.css";\n',
    "/pages/a/_x/nested/index.tsx": "export {};\n",
    "/pages/a/_x/reexport.ts": "export {};\n",
    "/pages/a/_x/lazy.tsx": 'import "./static";\n',
    "/pages/a/unrelated.tsx": "export {};\n",
    "/shared/util.ts": 'import "./deep";\n',
    "/shared/deep.ts": "export {};\n",
  });

  it("follows static, re-exported and dynamic relative imports breadth-first, once each", () => {
    const graph = pageModuleGraph({ host, pageFile: "/pages/a/page.tsx", pagesDir: "/pages" });

    expect(graph.files).toEqual([
      "/pages/a/page.tsx",
      "/pages/a/_x/static.ts",
      "/pages/a/_x/reexport.ts",
      "/pages/a/_x/lazy.tsx",
      "/pages/a/_x/nested/index.tsx",
    ]);
  });

  it("lists resolved imports outside the pages directory without following them, and ignores bare packages and assets", () => {
    const graph = pageModuleGraph({ host, pageFile: "/pages/a/page.tsx", pagesDir: "/pages" });

    expect(graph.external).toEqual(["/shared/util.ts"]);
  });

  it("fails fast when the page itself cannot be read", () => {
    expect(() => pageModuleGraph({ host, pageFile: "/pages/a/missing.tsx", pagesDir: "/pages" })).toThrow(/cannot read \/pages\/a\/missing\.tsx/);
  });
});
