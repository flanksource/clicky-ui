import {
  MarkdownEditor,
  type MarkdownEditorPreviewFormat,
  type MarkdownEditorPreviewRequest,
  type MarkdownEditorPreviewResult,
} from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

const sample = `# Quarterly notes

Revenue is **ahead of plan** and support volume is trending down.

| Segment | Status | Change |
| ------- | ------ | ------ |
| SaaS    | Green  | +12%   |
| Support | Amber  | -3%    |

> Review the variance note before export.`;

export function MarkdownEditorDemo() {
  return (
    <DemoSection
      id="markdown-editor"
      title="MarkdownEditor"
      description="Split-pane markdown editing with local React preview and optional Clicky-backed format previews."
    >
      <MarkdownEditor
        defaultValue={sample}
        defaultPreviewFormat="react"
        previewDebounceMs={0}
        loadPreview={mockClickyPreview}
      />
    </DemoSection>
  );
}

function mockClickyPreview({
  markdown,
  format,
}: MarkdownEditorPreviewRequest): MarkdownEditorPreviewResult {
  switch (format) {
    case "react":
      return {
        kind: "clicky",
        data: {
          version: 1,
          node: {
            kind: "map",
            fields: [
              {
                name: "title",
                label: "Title",
                value: { kind: "text", text: "Quarterly notes" },
              },
              {
                name: "characters",
                label: "Characters",
                value: { kind: "text", text: String(markdown.length) },
              },
            ],
          },
        },
      };
    case "html":
      return {
        kind: "html",
        html: `<article><h1>Quarterly notes</h1><p>${markdown.length} characters</p></article>`,
      };
    case "json":
      return {
        kind: "json",
        data: previewSummary(markdown, format),
      };
    case "csv":
      return {
        kind: "text",
        text: `metric,value\ncharacters,${markdown.length}\nheadings,${
          markdown.match(/^#/gm)?.length ?? 0
        }`,
      };
    case "pdf":
      return {
        kind: "url",
        url: "/samples/clicky/services.json?format=pdf",
      };
    case "excel":
      return {
        kind: "url",
        url: "/samples/clicky/services.json?format=excel",
      };
    case "markdown":
      return {
        kind: "text",
        text: markdown,
      };
  }
}

function previewSummary(
  markdown: string,
  format: MarkdownEditorPreviewFormat,
) {
  return {
    format,
    characters: markdown.length,
    headings: markdown.match(/^#/gm)?.length ?? 0,
  };
}
