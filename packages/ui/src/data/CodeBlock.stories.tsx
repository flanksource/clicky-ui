import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeBlock } from "./CodeBlock";

const meta: Meta<typeof CodeBlock> = {
  title: "Data/CodeBlock",
  component: CodeBlock,
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

export const TypeScript: Story = {
  args: {
    language: "typescript",
    source: `type Service = {
  name: string;
  status: "healthy" | "degraded";
};

export function label(service: Service) {
  return \`\${service.name}: \${service.status}\`;
}`,
  },
};

export const InteractiveJson: Story = {
  args: {
    language: "json",
    source: JSON.stringify(
      {
        service: "api",
        status: "healthy",
        metrics: { requests: 12492, errors: 3, p95: "82ms" },
        labels: ["prod", "edge"],
      },
      null,
      2,
    ),
  },
};

export const ChromaXml: Story = {
  args: {
    language: "xml",
    source: "<Activity><Math/></Activity>",
    highlightedHtml:
      '<pre class="chroma"><span class="nt">&lt;Activity&gt;</span><span class="nt">&lt;Math/&gt;</span><span class="nt">&lt;/Activity&gt;</span></pre>',
  },
};
