import { describe, expect, it } from "vitest";
import { compileExportMdx } from "./export-compiler.ts";

const PAGE = "# Report\n\nPublic summary.\n\nInternal margin figures.\n";
type Tree = { children: Array<{ type: string; children?: Array<{ value?: string }> }> };
/** Drops paragraphs whose text starts with `options.prefix`, like a redaction plugin removing classified regions. */
const dropParagraphs = (options: { prefix: string }) => (tree: Tree) => {
  tree.children = tree.children.filter((node) => !(node.type === "paragraph" && node.children?.[0]?.value?.startsWith(options.prefix)));
};

describe("compileExportMdx", () => {
  it.each([
    ["without plugins keeps every paragraph", [], ["Public summary.", "Internal margin figures."], []],
    ["applies a declared plugin with its options after the base set", [[dropParagraphs, { prefix: "Internal" }]], ["Public summary."], ["Internal margin figures."]],
  ])("%s", async (_case, remark, kept, removed) => {
    const code = await compileExportMdx({ path: "report.md", code: PAGE, remark });
    expect({ kept: kept.filter((text) => code.includes(text)), removed: removed.filter((text) => code.includes(text)) }).toEqual({ kept, removed: [] });
  });

  it("rejects a page that imports other Markdown, which the export plugins would not reach", async () => {
    await expect(compileExportMdx({ path: "report.mdx", code: 'import Appendix from "./appendix.md";\n\n# Report\n\n<Appendix />\n', remark: [] })).rejects.toThrow("report.mdx: export compiler plugins do not apply to imported Markdown (./appendix.md)");
  });
});
