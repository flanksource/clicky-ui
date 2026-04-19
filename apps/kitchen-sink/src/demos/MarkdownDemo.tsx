import { Markdown } from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

const sample = `# Heading

This is a **bold** statement and a [link](https://example.com).

- item one
- item two
- item three

\`\`\`js
const x = 42;
\`\`\`

> A thoughtful quote.

| Col A | Col B |
|-------|-------|
| 1     | 2     |
| 3     | 4     |
`;

export function MarkdownDemo() {
  return (
    <DemoSection
      id="markdown"
      title="Markdown"
      description="Tailwind-styled marked renderer; marked loads lazily via dynamic import."
    >
      <Markdown text={sample} />
    </DemoSection>
  );
}
