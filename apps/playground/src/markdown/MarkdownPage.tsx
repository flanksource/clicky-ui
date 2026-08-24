import { Markdown } from "@flanksource/clicky-ui";

export function MarkdownPage({
  markdown,
  error,
}: {
  markdown: string | null;
  error: string | null;
}) {
  if (error) {
    throw new Error(`could not generate playground Markdown: ${error}`);
  }
  if (markdown === null) {
    return <p className="text-sm text-muted-foreground">Generating Markdown…</p>;
  }
  return <Markdown text={markdown} className="mx-auto max-w-4xl" />;
}
