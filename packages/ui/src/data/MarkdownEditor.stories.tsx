import type { Meta, StoryObj } from "@storybook/react-vite";
import { MarkdownEditor } from "./MarkdownEditor";
import type {
  MarkdownEditorPreviewFormat,
  MarkdownEditorPreviewRequest,
  MarkdownEditorPreviewResult,
} from "./MarkdownEditor.model";

const sample = `# Markdown report

Revenue stayed **ahead of plan** for the quarter.

| Segment | Status | Change |
| ------- | ------ | ------ |
| SaaS    | Green  | +12%   |
| Support | Amber  | -3%    |

> Export-ready notes can be checked before publishing.`;

const meta: Meta<typeof MarkdownEditor> = {
  title: "Data/MarkdownEditor",
  component: MarkdownEditor,
  args: {
    defaultValue: sample,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Split-pane markdown editor with local React preview and optional Clicky-backed previews for HTML, Markdown, PDF, JSON, CSV, and Excel outputs.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MarkdownEditor>;

export const LocalPreview: Story = {};

export const ClickyBackedPreview: Story = {
  args: {
    defaultPreviewFormat: "json",
    previewDebounceMs: 0,
    loadPreview: async ({
      markdown,
      format,
    }: MarkdownEditorPreviewRequest): Promise<MarkdownEditorPreviewResult> =>
      mockClickyPreview(markdown, format),
  },
};

function mockClickyPreview(
  markdown: string,
  format: MarkdownEditorPreviewFormat,
): MarkdownEditorPreviewResult {
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
                value: { kind: "text", text: "Markdown report" },
              },
              {
                name: "length",
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
        html: `<article><h1>Markdown report</h1><p>${markdown.length} characters</p></article>`,
      };
    case "json":
      return {
        kind: "json",
        data: {
          format,
          characters: markdown.length,
          headings: markdown.match(/^#/gm)?.length ?? 0,
        },
      };
    case "csv":
      return {
        kind: "text",
        text: "metric,value\ncharacters," + markdown.length,
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
