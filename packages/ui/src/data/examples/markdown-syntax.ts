import source from "./markdown-syntax.md?raw";

export type MarkdownSyntaxSection = {
  /** Slug of the title; used for demo anchors and test lookups. */
  id: string;
  title: string;
  /** The section snippet, renderable on its own. */
  markdown: string;
};

// The reference is authored as real markdown so the snippets stay readable and
// escape-free. `<!--section:Title-->` markers split it into per-feature blocks;
// they are HTML comments, so they render as nothing when the whole file is fed
// to Markdown in one piece.
const SECTION_MARKER = /^<!--section:(.+?)-->$/m;

function slug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function splitSections(text: string): MarkdownSyntaxSection[] {
  // String.split with a capturing group interleaves [preamble, title, body, ...].
  const parts = text.split(SECTION_MARKER);
  const sections: MarkdownSyntaxSection[] = [];
  for (let index = 1; index < parts.length; index += 2) {
    const title = parts[index]?.trim();
    const markdown = parts[index + 1]?.trim();
    if (!title || !markdown) {
      throw new Error(`markdown-syntax.md: empty section at marker ${index}`);
    }
    sections.push({ id: slug(title), title, markdown });
  }
  if (sections.length === 0) {
    throw new Error("markdown-syntax.md: no <!--section:...--> markers found");
  }
  return sections;
}

/** Every supported (and explicitly unsupported) construct, one entry per feature. */
export const MARKDOWN_SYNTAX_SECTIONS: readonly MarkdownSyntaxSection[] =
  splitSections(source);

/** The same sections as one navigable document, each under its own `##` heading. */
export const MARKDOWN_SYNTAX_DOCUMENT = [
  "# Markdown syntax reference",
  ...MARKDOWN_SYNTAX_SECTIONS.map(
    (section) => `## ${section.title}\n\n${section.markdown}`,
  ),
].join("\n\n");
