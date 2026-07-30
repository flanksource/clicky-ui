import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { MarkdownEditor } from "./MarkdownEditor";
import { mockMarkdownPreview } from "./examples/markdown-preview-mock";
import { MARKDOWN_SYNTAX_DOCUMENT } from "./examples/markdown-syntax";

const meta: Meta<typeof MarkdownEditor> = {
  title: "Data/MarkdownEditor",
  component: MarkdownEditor,
  args: {
    defaultValue: MARKDOWN_SYNTAX_DOCUMENT,
    minHeight: 640,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Split-pane markdown editor seeded with the complete syntax reference. The React pane renders locally through `Markdown`; HTML, Markdown, PDF, JSON, CSV, and Excel come from a host-supplied `loadPreview`, which returns `undefined` for any format it wants to leave on the local preview.",
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
    loadPreview: mockMarkdownPreview,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("the backend derives its stats from the live buffer", async () => {
      await expect(await canvas.findByText("headings")).toBeInTheDocument();
    });

    await step("declining a format falls back to the local preview", async () => {
      await userEvent.click(canvas.getByRole("radio", { name: /react/i }));
      await expect(
        await canvas.findByRole("heading", { name: "Markdown syntax reference" }),
      ).toBeInTheDocument();
    });
  },
};
