import type { Meta, StoryObj } from "@storybook/react-vite";
import { Clicky, type ClickyDocument, type ClickyNode } from "./Clicky";
import { CodeBlock } from "./CodeBlock";

const meta: Meta<typeof CodeBlock> = {
  title: "Data/CodeBlock",
  component: CodeBlock,
  args: {
    language: "json",
    source: '{ "status": "ok" }',
    jsonDefaultOpenDepth: 2,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Code renderer for Clicky payloads and diagnostics. It prefers trusted highlighted HTML, falls back to async Shiki highlighting, and renders JSON as an expandable tree.",
      },
    },
  },
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

export const Java: Story = {
  args: {
    language: "java",
    source: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}`,
  },
};

export const Sql: Story = {
  args: {
    language: "sql",
    source: `SELECT id, name, greeting
  FROM greetings
 WHERE name = 'world'
 ORDER BY id
 LIMIT 1;`,
  },
};

export const Go: Story = {
  args: {
    language: "go",
    source: `package main

import "fmt"

func main() {
    fmt.Println("Hello, world!")
}`,
  },
};

export const Shell: Story = {
  args: {
    language: "bash",
    source: `#!/usr/bin/env bash
# Print a friendly greeting.
name="\${1:-world}"
echo "Hello, $name!"`,
  },
};

export const Yaml: Story = {
  args: {
    language: "yaml",
    source: `greeting:
  message: Hello, world!
  language: en
  audience:
    - developers
    - operators`,
  },
};

export const Python: Story = {
  args: {
    language: "python",
    source: `def greet(name: str = "world") -> str:
    return f"Hello, {name}!"


if __name__ == "__main__":
    print(greet())`,
  },
};

const codeNode = (language: string, source: string): ClickyNode => ({
  kind: "code",
  language,
  source,
});

const combinedDoc: ClickyDocument = {
  version: 1,
  node: {
    kind: "text",
    children: [
      { kind: "text", text: "Go", style: { className: "font-semibold text-sm mt-density-3" } },
      codeNode("go", `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, world!")\n}`),
      { kind: "text", text: "Python", style: { className: "font-semibold text-sm mt-density-3" } },
      codeNode("python", `def greet(name: str = "world") -> str:\n    return f"Hello, {name}!"`),
    ],
  },
};

export const ClickyCodeNodes: StoryObj<typeof Clicky> = {
  render: () => <Clicky data={combinedDoc} />,
};
