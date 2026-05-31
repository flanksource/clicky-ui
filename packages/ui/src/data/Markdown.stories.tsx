import type { Meta, StoryObj } from "@storybook/react-vite";
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
          "Markdown renderer for comments, generated docs, and Clicky text blocks. It lazy-loads `marked` and applies Clicky typography/code/link styles.",
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
