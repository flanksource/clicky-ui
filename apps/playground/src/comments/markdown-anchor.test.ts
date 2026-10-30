import { beforeEach, describe, expect, it } from "vitest";

import { captureLocators, commentAnchor, commentTarget, resolveAnchor, resolveComment } from "./dom-anchor";
import {
  describeMarkdown,
  markdownLocator,
  markdownTarget,
  parseMarkdownAnchor,
  resolveMarkdown,
  type MarkdownLocator,
} from "./markdown-anchor";

const RUN = "Run the installer from the release page.";
const SHARED = "See the changelog for details.";

/** Blocks as Markdown `sourceBlocks` renders them: top-level elements stamped with their source lines. */
type Block = [line: number, html: string];

const DOCUMENT: Block[] = [
  [1, "<h1>Guide</h1>"],
  [3, "<p>Intro to the guide.</p>"],
  [5, "<h2>Install</h2>"],
  [7, `<p>${RUN.replace("installer", "<strong>installer</strong>")}</p>`],
  [9, "<h3>Example</h3>"],
  [11, `<p>${SHARED}</p>`],
  [13, "<h2>Upgrade</h2>"],
  [15, "<ul><li>Back up first.</li><li>Stop the service.</li></ul>"],
  [18, "<h3>Example</h3>"],
  [20, `<p>${SHARED}</p>`],
  [22, "<hr>"],
];

function render(blocks: Block[]): HTMLElement {
  const html = blocks
    .map(([line, block]) => block.replace(/^<(\w+)/, `<$1 data-source-start="${line}" data-source-end="${line}"`))
    .join("");
  document.body.innerHTML = `<main id="artifact"><div data-annotated-markdown=""><div>${html}</div></div></main>`;
  return document.querySelector<HTMLElement>("#artifact")!;
}

function edit(blocks: Block[], line: number, html: string | null): Block[] {
  return blocks.flatMap((block) => (block[0] !== line ? [block] : html === null ? [] : [[line, html] as Block]));
}

function paragraph(text: string): Element {
  const found = [...document.querySelectorAll("p,li")].filter((element) => element.textContent === text);
  if (found.length !== 1) throw new Error(`expected one block reading ${JSON.stringify(text)}, found ${found.length}`);
  return found[0]!;
}

describe("markdown comment anchors", () => {
  let content: HTMLElement;
  beforeEach(() => {
    content = render(DOCUMENT);
  });

  it("snaps a click on inline text to its block and keys it on the heading path and text", () => {
    const strong = content.querySelector("strong")!;
    const block = commentTarget(strong, content);
    expect({
      block: block.textContent,
      anchor: parseMarkdownAnchor(commentAnchor(strong, content)!),
      locators: captureLocators(block, content),
    }).toEqual({
      block: RUN,
      anchor: { kind: "markdown", path: ["Guide", "Install"], tag: "p", text: RUN },
      locators: [{ kind: "markdown", path: ["Guide", "Install"], tag: "p", text: RUN, line: 7 }],
    });
  });

  it("comments on a single list item, and on the section heading for a block without text", () => {
    const item = paragraph("Stop the service.");
    const rule = content.querySelector("hr")!;
    const heading = markdownTarget(rule)!.block;
    expect([markdownTarget(item)?.block, markdownLocator(heading, content.firstElementChild!).path]).toEqual([
      item,
      ["Guide", "Upgrade", "Example"],
    ]);
  });

  it("tells a repeated sub-heading's text apart by the section it is in", () => {
    const shared = [...content.querySelectorAll("p")].filter((p) => p.textContent === SHARED);
    const underUpgrade = shared[1]!;
    const locator = markdownLocator(underUpgrade, content.firstElementChild!);
    expect({
      path: locator.path,
      anchored: resolveAnchor(content, commentAnchor(underUpgrade, content)!),
    }).toEqual({ path: ["Guide", "Upgrade", "Example"], anchored: underUpgrade });
  });

  describe("after the document changes", () => {
    let locator: MarkdownLocator;
    let anchor: string;
    beforeEach(() => {
      const block = paragraph(RUN);
      locator = captureLocators(block, content)[0] as MarkdownLocator;
      anchor = commentAnchor(block, content)!;
    });

    it("stays on its block when blocks above it are added", () => {
      content = render([[1, "<p>New preface.</p>"], ...DOCUMENT.map(([line, html]): Block => [line + 2, html])]);
      expect(resolveComment(content, anchor, [locator])).toMatchObject({
        element: paragraph(RUN),
        matchedBy: "anchor",
        conflict: false,
      });
    });

    it("finds a reworded block in its section and reports it as moved", () => {
      const reworded = "Run the installer from the downloads page.";
      content = render(edit(DOCUMENT, 7, `<p>${reworded}</p>`));
      expect([
        resolveMarkdown(content, locator),
        resolveComment(content, anchor, [locator])?.matchedBy,
      ]).toEqual([{ element: paragraph(reworded), how: "edited" }, locator]);
    });

    it("finds the text elsewhere when its section heading is renamed", () => {
      content = render(edit(DOCUMENT, 5, "<h2>Installation</h2>"));
      expect(resolveMarkdown(content, locator)).toEqual({ element: paragraph(RUN), how: "relocated" });
    });

    it("is an orphan once the block is deleted", () => {
      content = render(edit(DOCUMENT, 7, null));
      expect(resolveComment(content, anchor, [locator])).toBeNull();
    });
  });

  it.each([
    [{ path: ["Guide", "Install"], tag: "p", text: RUN }, `Guide › Install — paragraph “${RUN}”`],
    [{ path: ["Guide", "Install"], tag: "h2", text: "Install" }, "Guide — heading “Install”"],
    [{ path: [], tag: "li", text: "Loose item" }, "list item “Loose item”"],
  ])("describes %j as %s", (locator, label) => {
    expect(describeMarkdown(locator)).toBe(label);
  });
});
