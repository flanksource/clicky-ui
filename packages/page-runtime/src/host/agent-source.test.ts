import { expect, it } from "vitest";
import { isPageSource } from "./agent-source.ts";

it.each(["report.tsx:1:2", "report.tsx:1:2#0@012345abcdef"])("recognizes page source %s", (source) => expect(isPageSource(source)).toBe(true));
it.each([
  "report.tsx:1:2#9007199254740992@012345abcdef", "report.tsx:0:2#0@012345abcdef", "report.tsx:1:2#0@bad",
  "node_modules/facet/report.tsx:1:2#0@012345abcdef", "/npm/facet/report.tsx:1:2#0@012345abcdef",
  "/link/library/report.tsx:1:2#0@012345abcdef", "packages/ui/report.tsx:1:2#0@012345abcdef", "__runtime/report.tsx:1:2#0@012345abcdef",
])("rejects invalid, library or runtime source %s", (source) => expect(isPageSource(source)).toBe(false));
