import { describe, expect, it } from "vitest";
import { readPageDependencies, updatePageDependency } from "../src/browser-mode/dependencies";

const body = 'import { parse } from "yaml";\nexport default function Page() { return <p>{parse("name: Ada").name}</p>; }\n';
const dependency = { name: "yaml", version: "^2.0.0" };

describe("page dependency headers", () => {
  it.each(["report.tsx", "report.md", "report.mdx"])("inserts dependencies and preserves the entire body in %s", file => {
    const source = file.endsWith("tsx") ? body : "# Report\n\nA report.\n";
    const updated = updatePageDependency({ file, source, ...dependency });
    expect(readPageDependencies({ file, source: updated })).toEqual({ yaml: "^2.0.0" });
    expect(updated.endsWith(source)).toBe(true);
    expect(updatePageDependency({ file, source: updated, ...dependency })).toBe(updated);
  });

  it("retains a license banner, CRLF, YAML comments, and other metadata", () => {
    const source = '/* License */\r\n/*\r\n---\r\ntitle: Report # keep title\r\ndependencies:\r\n  yaml: "^1.0.0" # keep dependency\r\n---\r\n*/\r\n' + body;
    const updated = updatePageDependency({ file: "report.tsx", source, ...dependency });
    expect(readPageDependencies({ file: "report.tsx", source: updated })).toEqual({ yaml: "^2.0.0" });
    expect(updated).toContain("# keep title\r\n");
    expect(updated).toContain("# keep dependency\r\n");
    expect(updated.startsWith("/* License */\r\n")).toBe(true);
    expect(updated.endsWith(body)).toBe(true);
  });

  it.each([
    ['dependencies:\n  yaml: "^2"\n  yaml: "^3"', "duplicate"],
    ["dependencies: [yaml]", "mapping"],
    ["dependencies:\n  yaml: 2", "version"],
    ['dependencies:\n  yaml: "file:../yaml"', "version"],
    ['dependencies:\n  yaml: "[broken"\nother: [', "YAML"],
  ])("rejects invalid declarations with source context", (yaml, message) => {
    expect(() => readPageDependencies({ file: "report.tsx", source: `/*\n---\n${yaml}\n---\n*/\n${body}` })).toThrow(new RegExp(`report.tsx:.*${message}`, "i"));
  });

  it("does not interpret comments or YAML-looking strings inside the page body", () => {
    expect(readPageDependencies({ file: "report.tsx", source: body + '\nconst example = "dependencies: ignored";' })).toEqual({});
  });
});
