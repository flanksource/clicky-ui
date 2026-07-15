import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Markdown } from "./Markdown";

const meta: Meta<typeof Markdown> = {
  title: "Data/Markdown",
  component: Markdown,
  args: {
    text: "### Status\\n\\nService is **healthy**.",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Markdown renderer for comments, generated docs, and Clicky text blocks. It lazy-loads `streamdown` and renders fenced code blocks with the theme-aware `CodeBlock` component.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Markdown>;

export const Rich: Story = {
  args: {
    text: `# Heading

This is a **bold** statement and a [link](https://example.com).

- item one
- item two
- item three

\`\`\`js
const x = 42;
\`\`\`

> A thoughtful quote.

| Service | Status   | Restarts |
| ------- | -------- | -------- |
| api     | healthy  | 0        |
| worker  | degraded | 3        |`,
  },
};

export const CodeBlocks: Story = {
  args: {
    text: `Set the request \`timeout\` in the config below.

\`\`\`yaml
service:
  name: api
  timeout: 300
\`\`\``,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("fenced block renders via the library CodeBlock", async () => {
      // CodeBlock stamps a language header; Streamdown's own block is replaced.
      await expect(await canvas.findByText("yaml")).toBeInTheDocument();
      expect(canvasElement.querySelector('[data-streamdown="code-block"]')).toBeNull();
      expect(canvasElement.querySelector(".not-prose")).not.toBeNull();
    });

    await step("code body carries the fenced content", async () => {
      await expect(canvasElement.textContent).toContain("timeout: 300");
    });

    await step("header exposes copy, download, and per-block theme controls", async () => {
      await expect(await canvas.findByLabelText("Copy code")).toBeInTheDocument();
      expect(canvas.getByLabelText("Download code")).toBeInTheDocument();
      expect(canvas.getByLabelText(/Switch to (dark|light) theme/)).toBeInTheDocument();
    });

    await step("inline code stays inline", async () => {
      const inline = await canvas.findByText("timeout", { selector: "code" });
      expect(inline.closest('[data-streamdown="code-block"]')).toBeNull();
    });
  },
};
