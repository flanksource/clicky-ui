import type {
  MarkdownEditorPreviewRequest,
  MarkdownEditorPreviewResult,
} from "../MarkdownEditor.model";

export type MarkdownDocumentStats = {
  title: string;
  characters: number;
  headings: number;
  codeBlocks: number;
  tables: number;
  tasks: number;
};

/**
 * Counts the constructs a conversion backend would report for a document. Kept
 * next to the syntax reference so demos can show numbers that move as the
 * editor buffer changes rather than a frozen fixture.
 */
export function markdownDocumentStats(markdown: string): MarkdownDocumentStats {
  return {
    title: /^#\s+(.+)$/m.exec(markdown)?.[1] ?? "Untitled",
    characters: markdown.length,
    headings: markdown.match(/^#{1,6}\s/gm)?.length ?? 0,
    codeBlocks: Math.floor((markdown.match(/^\s*```/gm)?.length ?? 0) / 2),
    // A table is identified by its delimiter row, e.g. `| :-- | --: |`.
    tables: markdown.match(/^\|[\s|:-]+\|$/gm)?.length ?? 0,
    tasks: markdown.match(/^\s*- \[[ x]\]/gm)?.length ?? 0,
  };
}

/**
 * Stands in for Clicky's `format=` conversion endpoint so `MarkdownEditor`
 * demos exercise every preview kind without a server. `react` returns
 * `undefined` because Clicky has no such format — declining leaves that pane on
 * the local preview.
 */
export function mockMarkdownPreview({
  markdown,
  format,
}: MarkdownEditorPreviewRequest): MarkdownEditorPreviewResult | undefined {
  const stats = markdownDocumentStats(markdown);

  switch (format) {
    case "react":
      return undefined;
    case "html":
      return {
        kind: "html",
        html: `<article><h1>${stats.title}</h1><p>${stats.headings} headings, ${stats.codeBlocks} code blocks, ${stats.tables} tables.</p></article>`,
      };
    case "json":
      return { kind: "json", data: { format, ...stats } };
    case "csv":
      return {
        kind: "text",
        text: ["metric,value", ...Object.entries(stats).map(([k, v]) => `${k},${v}`)].join("\n"),
      };
    case "pdf":
      return { kind: "url", url: "/samples/clicky/services.json?format=pdf" };
    case "excel":
      return { kind: "url", url: "/samples/clicky/services.json?format=excel" };
    case "markdown":
      return { kind: "text", text: markdown };
  }
}
