import { CodeBlock, Markdown, MARKDOWN_SYNTAX_SECTIONS } from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

export function MarkdownDemo() {
  return (
    <DemoSection
      id="markdown"
      title="Markdown"
      description="Every construct the Streamdown-backed renderer handles, source beside result. CommonMark plus the GFM extensions (tables, task lists, strikethrough, literal autolinks, footnotes) and an allow-listed subset of raw HTML; fenced code routes through the library CodeBlock."
    >
      {MARKDOWN_SYNTAX_SECTIONS.map((section) => (
        <section
          key={section.id}
          id={`markdown-${section.id}`}
          className="space-y-density-2 scroll-mt-density-4"
        >
          <h3 className="text-sm font-semibold">{section.title}</h3>
          <div className="grid min-w-0 gap-density-3 lg:grid-cols-2">
            <CodeBlock
              source={section.markdown}
              language="markdown"
              className="min-w-0"
              copyable
            />
            <div className="min-w-0 rounded-md border border-border px-density-3 py-density-2">
              <Markdown text={section.markdown} />
            </div>
          </div>
        </section>
      ))}
    </DemoSection>
  );
}
