/** @vitest-environment jsdom */

import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Markdown } from "../Markdown";
import {
  MARKDOWN_SYNTAX_DOCUMENT,
  MARKDOWN_SYNTAX_SECTIONS,
  type MarkdownSyntaxSection,
} from "./markdown-syntax";

// Each section claims to demonstrate a construct; these assertions check the
// claim against what Streamdown actually produces, so a renderer or plugin
// change that silently drops a feature fails here instead of in the demo.
type SectionExpectation = (root: HTMLElement) => void;

const EXPECTATIONS: Record<string, SectionExpectation> = {
  headings: (root) => {
    for (const level of [1, 2, 3, 4, 5, 6]) {
      expect(root.querySelectorAll(`h${level}`).length).toBeGreaterThan(0);
    }
    // The two setext headings add a second h1 and a third h2.
    expect(root.querySelectorAll("h1")).toHaveLength(2);
    expect(root.querySelectorAll("h2")).toHaveLength(2);
  },
  "paragraphs-and-line-breaks": (root) => {
    // One break from the two trailing spaces, one from the trailing backslash.
    expect(root.querySelectorAll("br")).toHaveLength(2);
    expect(root.textContent).toContain("join back into a single line");
  },
  "emphasis-and-inline-styles": (root) => {
    expect(root.querySelectorAll("em").length).toBeGreaterThanOrEqual(3);
    expect(root.querySelectorAll('[data-streamdown="strong"]').length).toBeGreaterThanOrEqual(3);
    expect(root.querySelector("del")?.textContent).toBe("strikethrough");
    expect(textsOf(root, "code")).toContain("A span containing a ` backtick");
  },
  "escapes-and-entities": (root) => {
    expect(root.textContent).toContain("*not emphasis*");
    expect(root.textContent).toContain("`not code`");
    expect(root.textContent).toContain("# not a heading");
    expect(root.querySelector("em")).toBeNull();
    expect(root.textContent).toContain("© 2026");
    expect(root.textContent).toContain("A & B");
    expect(root.textContent).toContain("—");
    expect(root.textContent).toContain("…");
  },
  lists: (root) => {
    expect(root.querySelectorAll("ul").length).toBeGreaterThanOrEqual(2);
    expect(root.querySelectorAll("ol").length).toBeGreaterThanOrEqual(2);
    // Nested two levels deep: a ul inside a li inside a ul.
    expect(root.querySelector("ul li ul li ul li")).not.toBeNull();
    expect(root.querySelector("ol li ol li")).not.toBeNull();
    // The fenced block inside a list item routes to the library CodeBlock.
    expect(root.querySelector("li .not-prose")).not.toBeNull();
    // Every level carries its own marker and padding as standalone utilities:
    // Streamdown's own `[li_&]:pl-6` needs Tailwind to scan its dist, which
    // consumers do not do, and Tailwind preflight strips the default marker.
    const marker = (selector: string, expected: string) =>
      [...root.querySelectorAll(selector)].every(
        (list) => list.classList.contains(expected) && list.classList.contains("pl-6"),
      );
    expect(marker("ul", "list-disc")).toBe(true);
    expect(marker("ol", "list-decimal")).toBe(true);
  },
  "task-lists": (root) => {
    const boxes = root.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    expect(boxes).toHaveLength(3);
    expect([...boxes].map((box) => box.checked)).toEqual([true, false, false]);
    expect([...boxes].every((box) => box.disabled)).toBe(true);
    // The checkbox is the marker, so the bullet and its indent are dropped.
    const list = root.querySelector("ul");
    expect(list?.classList.contains("list-none")).toBe(true);
    expect(list?.classList.contains("pl-0")).toBe(true);
  },
  links: (root) => {
    const links = textsOf(root, '[data-streamdown="link"]');
    expect(links).toEqual([
      "inline link",
      "with a title",
      "a page fragment",
      "https://example.com",
      "https://example.com",
      "www.example.com",
      "hello@example.com",
    ]);
  },
  images: (root) => {
    const img = root.querySelector("img");
    expect(img?.getAttribute("src")).toBe("/samples/markdown/swatch.svg");
    expect(img?.getAttribute("alt")).toBe("A blue swatch");
    expect(img?.getAttribute("title")).toBe("Images take an optional title");
    // The second image uses a data: URI, which the sanitizer refuses.
    expect(root.querySelectorAll("img")).toHaveLength(1);
    expect(root.textContent).toContain("[Image blocked: A blocked inline image]");
  },
  blockquotes: (root) => {
    expect(root.querySelectorAll("blockquote")).toHaveLength(3);
    expect(root.querySelector("blockquote blockquote")?.textContent).toContain(
      "and a nested quote",
    );
    expect(root.querySelector("blockquote ul li")).not.toBeNull();
  },
  code: (root) => {
    // Fenced-with-language, fenced-without, and indented all render as CodeBlocks.
    expect(root.querySelectorAll(".not-prose")).toHaveLength(3);
    expect(codeLanguagesOf(root)).toEqual(["ts", "text", "text"]);
    expect(root.textContent).toContain("export function greet");
    expect(root.textContent).toContain("indented code block");
  },
  tables: (root) => {
    const tables = root.querySelectorAll("table");
    expect(tables).toHaveLength(2);
    expect(alignmentsOf(tables[0])).toEqual(["left", "center", "right"]);
    // Streamdown's own table chrome is replaced wholesale: it shades the header
    // with `bg-muted/80`, which the consumer's Tailwind never compiles, and
    // wraps the table in a `bg-sidebar` card that reads as a dark navy box.
    expect(root.querySelector('[data-streamdown="table-wrapper"]')).toBeNull();
    for (const table of tables) {
      const scroller = table.parentElement;
      expect(scroller?.classList.contains("overflow-x-auto")).toBe(true);
      expect(scroller?.classList.contains("border-border")).toBe(true);
      expect(table.querySelector("thead")?.classList.contains("bg-muted")).toBe(true);
      expect(table.querySelector("tbody")?.classList.contains("divide-y")).toBe(true);
    }
    for (const cell of root.querySelectorAll("th, td")) {
      expect(cell.classList.contains("px-density-3")).toBe(true);
    }
    const cells = tables[1]?.querySelectorAll("tbody td");
    expect(cells?.[1]?.querySelector('[data-streamdown="strong"]')?.textContent).toBe("bold");
    expect(cells?.[1]?.querySelector("del")?.textContent).toBe("struck");
    expect(cells?.[3]?.textContent).toBe("a | b");
    expect(cells?.[5]?.textContent).toBe("");
  },
  footnotes: (root) => {
    expect(root.querySelectorAll("sup")).toHaveLength(2);
    const notes = root.querySelector("[data-footnotes]");
    expect(notes?.querySelectorAll("li")).toHaveLength(2);
    expect(notes?.textContent).toContain("A numbered footnote definition.");
    expect(notes?.textContent).toContain("ordered by first reference");
  },
  "thematic-breaks": (root) => {
    expect(root.querySelectorAll("hr")).toHaveLength(3);
  },
  "inline-html": (root) => {
    expect(textsOf(root, "kbd")).toEqual(["Ctrl", "C"]);
    expect(root.querySelector("sub")?.textContent).toBe("2");
    expect(root.querySelector("sup")?.textContent).toBe("2");
    expect(root.querySelector("ins")?.textContent).toBe("inserted");
    expect(root.querySelector("del")?.textContent).toBe("deleted");
    expect(root.querySelector("br")).not.toBeNull();
    expect(root.querySelector("details summary")?.textContent).toBe("A collapsible section");
    expect(root.querySelector("details ul li")).not.toBeNull();
    expect(textsOf(root, "dl dt")).toEqual(["Definition list"]);
    expect(root.querySelector("div[align=center]")?.textContent).toBe("A centered block.");
  },
  "sanitized-html": (root) => {
    expect(root.querySelector("script")).toBeNull();
    expect(root.textContent).not.toContain("alert");
    // Unlisted tags are unwrapped: the words survive, the elements do not.
    expect(root.querySelector("mark")).toBeNull();
    expect(root.querySelector("abbr")).toBeNull();
    expect(root.textContent).toContain("mark");
    expect(root.textContent).toContain("abbr");
    expect(root.innerHTML).not.toContain("this comment is not rendered");
  },
  "unsupported-syntax": (root) => {
    // Reference links, math, and mermaid all survive as literal text.
    expect(root.textContent).toContain("[reference links][ref]");
    expect(root.textContent).toContain("![reference images][ref]");
    expect(root.textContent).toContain("$E = mc^2$");
    expect(root.textContent).toContain("$$a^2 + b^2 = c^2$$");
    // A mermaid fence renders as a plain code block, not a diagram.
    expect(root.querySelector("svg[id^=mermaid]")).toBeNull();
    expect(codeLanguagesOf(root)).toEqual(["mermaid"]);
    expect(root.textContent).toContain("A[Start] --> B[Finish];");
  },
};

function textsOf(root: HTMLElement, selector: string) {
  return [...root.querySelectorAll(selector)].map((node) => node.textContent);
}

// CodeBlock labels its language in the first span of its header row; the body
// below it holds highlighter spans, so anchor on the header rather than `span`.
function codeLanguagesOf(root: HTMLElement) {
  return textsOf(root, ".not-prose > div:first-child > span:first-child");
}

function alignmentsOf(table: Element | undefined) {
  return [...(table?.querySelectorAll<HTMLElement>("thead th") ?? [])].map(
    (cell) => cell.style.textAlign,
  );
}

async function renderMarkdown(text: string) {
  const { container } = render(<Markdown text={text} />);
  // Streamdown is loaded lazily; the `prose` wrapper only appears once it lands.
  await waitFor(() => expect(container.querySelector(".prose")).not.toBeNull());
  return container.querySelector<HTMLElement>(".prose") as HTMLElement;
}

describe("markdown syntax reference", () => {
  it("names every section exactly once", () => {
    const ids = MARKDOWN_SYNTAX_SECTIONS.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(Object.keys(EXPECTATIONS));
  });

  it.each(MARKDOWN_SYNTAX_SECTIONS.map((section) => [section.id, section] as const))(
    "renders the %s section as documented",
    async (id: string, section: MarkdownSyntaxSection) => {
      const expectation = EXPECTATIONS[id];
      expect(expectation, `no expectation for section "${id}"`).toBeDefined();
      expectation?.(await renderMarkdown(section.markdown));
    },
  );

  describe("combined document", () => {
    it("carries every section under its own heading", () => {
      for (const section of MARKDOWN_SYNTAX_SECTIONS) {
        expect(MARKDOWN_SYNTAX_DOCUMENT).toContain(`## ${section.title}`);
        expect(MARKDOWN_SYNTAX_DOCUMENT).toContain(section.markdown);
      }
    });

    it("drops the section markers", () => {
      expect(MARKDOWN_SYNTAX_DOCUMENT).not.toContain("<!--section:");
    });

    it("renders as one document", async () => {
      const root = await renderMarkdown(MARKDOWN_SYNTAX_DOCUMENT);
      await waitFor(() =>
        expect(root.querySelectorAll("table").length).toBeGreaterThanOrEqual(2),
      );
      expect(root.querySelector("h1")?.textContent).toBe("Markdown syntax reference");
      expect(root.querySelectorAll('input[type="checkbox"]')).toHaveLength(3);
    });
  });
});
