import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { Markdown } from "./Markdown";
import {
  MARKDOWN_SYNTAX_DOCUMENT,
  MARKDOWN_SYNTAX_SECTIONS,
} from "./examples/markdown-syntax";

const meta: Meta<typeof Markdown> = {
  title: "Data/Markdown",
  component: Markdown,
  args: {
    text: "### Status\n\nService is **healthy**.",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Markdown renderer for comments, generated docs, and Clicky text blocks. It lazy-loads `streamdown`, renders fenced code blocks with the theme-aware `CodeBlock` component, and styles lists and tables itself so they do not depend on classes shipped inside `streamdown`'s dist. The stories below walk the complete supported syntax, one construct per story; `AllSyntax` renders them as a single document.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Markdown>;

// Every story below is one section of the shared syntax reference, so the
// Storybook catalog and the kitchen-sink demo can never drift apart.
function section(id: string): Story {
  const match = MARKDOWN_SYNTAX_SECTIONS.find((candidate) => candidate.id === id);
  if (!match) {
    throw new Error(`markdown-syntax.md has no section "${id}"`);
  }
  return { name: match.title, args: { text: match.markdown } };
}

export const AllSyntax: Story = {
  name: "All syntax",
  args: { text: MARKDOWN_SYNTAX_DOCUMENT },
};

export const Headings = section("headings");
export const ParagraphsAndLineBreaks = section("paragraphs-and-line-breaks");
export const EmphasisAndInlineStyles = section("emphasis-and-inline-styles");
export const EscapesAndEntities = section("escapes-and-entities");

export const Lists: Story = {
  ...section("lists"),
  play: async ({ canvasElement, step }) => {
    // Streamdown loads lazily, so wait for the nested markup before measuring.
    await step("nested lists indent one level at a time", async () => {
      await waitFor(() =>
        expect(canvasElement.querySelectorAll("ul ul, ol ol").length).toBeGreaterThan(0),
      );
      for (const list of canvasElement.querySelectorAll("ul, ol")) {
        // Streamdown styles lists with classes that only compile if the consumer's
        // Tailwind scans its dist; Markdown owns the marker and the indent so both
        // ship with the library.
        const style = getComputedStyle(list);
        expect(style.paddingLeft).not.toBe("0px");
        expect(style.listStyleType).not.toBe("none");
      }
    });
  },
};

export const TaskLists: Story = {
  ...section("task-lists"),
  play: async ({ canvasElement, step }) => {
    await step("checkboxes render read-only in the source order", async () => {
      const boxes = await waitFor(() => {
        const found = canvasElement.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
        expect(found).toHaveLength(3);
        return [...found];
      });
      expect(boxes.map((box) => box.checked)).toEqual([true, false, false]);
      expect(boxes.every((box) => box.disabled)).toBe(true);
    });

    await step("the checkbox replaces the bullet, so the row is flush", async () => {
      const list = canvasElement.querySelector("ul");
      expect(list && getComputedStyle(list).listStyleType).toBe("none");
      expect(list && getComputedStyle(list).paddingLeft).toBe("0px");
    });
  },
};

export const Links = section("links");
export const Images = section("images");
export const Blockquotes = section("blockquotes");

export const Code: Story = {
  ...section("code"),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("fenced blocks render via the library CodeBlock", async () => {
      // CodeBlock stamps a language header; Streamdown's own block is replaced.
      await expect(await canvas.findByText("ts")).toBeInTheDocument();
      expect(canvasElement.querySelector('[data-streamdown="code-block"]')).toBeNull();
      expect(canvasElement.querySelectorAll(".not-prose")).toHaveLength(3);
    });

    await step("header exposes copy, download, and per-block theme controls", async () => {
      expect((await canvas.findAllByLabelText("Copy code")).length).toBe(3);
      expect(canvas.getAllByLabelText("Download code").length).toBe(3);
      expect(canvas.getAllByLabelText(/Switch to (dark|light) theme/).length).toBe(3);
    });

    await step("inline code stays inline", async () => {
      const inline = await canvas.findByText("CodeBlock", { selector: "code" });
      expect(inline.closest(".not-prose")).toBeNull();
    });
  },
};

export const Tables: Story = {
  ...section("tables"),
  play: async ({ canvasElement, step }) => {
    const tables = await waitFor(() => {
      const found = canvasElement.querySelectorAll("table");
      expect(found).toHaveLength(2);
      return [...found];
    });

    await step("each table scrolls inside its own bordered container", async () => {
      for (const table of tables) {
        const scroller = table.parentElement as HTMLElement;
        expect(getComputedStyle(scroller).overflowX).toBe("auto");
        expect(getComputedStyle(scroller).borderBottomWidth).not.toBe("0px");
      }
      expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
    });

    await step("the header is shaded and rows are separated", async () => {
      // Streamdown shades the header with `bg-muted/80` and separates rows with
      // classes from its own dist, none of which a consumer's Tailwind compiles;
      // computed styles are the only way to catch that.
      const head = canvasElement.querySelector("thead") as HTMLElement;
      expect(getComputedStyle(head).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
      expect(getComputedStyle(head).borderBottomWidth).not.toBe("0px");
      expect(
        tables
          .flatMap((table) => [
            ...table.querySelectorAll<HTMLElement>("tbody tr:not(:last-child)"),
          ])
          .every((row) => getComputedStyle(row).borderBottomWidth !== "0px"),
      ).toBe(true);
    });

    await step("the delimiter row still drives column alignment", async () => {
      const heads = [...canvasElement.querySelectorAll<HTMLElement>("thead th")];
      expect(heads.map((cell) => getComputedStyle(cell).textAlign)).toEqual([
        "left",
        "center",
        "right",
        "left",
        "left",
      ]);
    });
  },
};
export const Footnotes = section("footnotes");
export const ThematicBreaks = section("thematic-breaks");
export const InlineHtml = section("inline-html");

export const SanitizedHtml: Story = {
  ...section("sanitized-html"),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("unlisted tags are unwrapped to their text", async () => {
      // Anchors the negative assertions below: without it they pass on an
      // empty canvas while Streamdown is still loading.
      await canvas.findByText(/mark/);
      expect(canvasElement.querySelector("mark")).toBeNull();
      expect(canvasElement.querySelector("abbr")).toBeNull();
    });

    await step("script tags and comments never reach the DOM", async () => {
      expect(canvasElement.querySelector("script")).toBeNull();
      expect(canvasElement.textContent).not.toContain("alert");
      expect(canvasElement.innerHTML).not.toContain("this comment is not rendered");
    });
  },
};

export const UnsupportedSyntax = section("unsupported-syntax");
