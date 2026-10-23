import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Keep the Shiki dynamic imports out of jsdom (same approach as Markdown.test.tsx).
vi.mock("../data/code-highlight", () => ({
  highlightCode: vi.fn(async () => null),
  highlightToLines: vi.fn(async () => null),
}));

import { AnnotatedMarkdown } from "./AnnotatedMarkdown";
import type { FileFinding } from "./types";

const DOC = [
  "# Title", // 1
  "", // 2
  "First paragraph", // 3
  "continues here.", // 4
  "", // 5
  "- a", // 6
  "- b", // 7
].join("\n");

function finding(line: number, severity: FileFinding["severity"], message: string): FileFinding {
  return { file: "docs/guide.md", line, severity, message, source: "markdownlint", rule: "MD013", kind: "lint" };
}

const FINDINGS = [
  finding(4, "warning", "Line too long"),
  finding(3, "error", "Heading expected"),
  finding(7, "info", "Prefer asterisks"),
];

async function renderedBlocks(container: HTMLElement) {
  await waitFor(() => {
    expect(container.querySelector("ul")).not.toBeNull();
    expect(container.querySelector("[data-finding-severity]")).not.toBeNull();
  });
  const block = (selector: string) => container.querySelector<HTMLElement>(selector)!;
  return { heading: block("h1"), paragraph: block("p"), list: block("ul") };
}

describe("AnnotatedMarkdown", () => {
  it("marks each block that holds a finding with the worst severity among them", async () => {
    const { container } = render(<AnnotatedMarkdown path="docs/guide.md" source={DOC} findings={FINDINGS} />);

    const { heading, paragraph, list } = await renderedBlocks(container);

    expect(heading.dataset.findingSeverity).toBeUndefined();
    expect(paragraph.dataset.findingSeverity).toBe("error");
    expect(list.dataset.findingSeverity).toBe("info");
  });

  it("lists every finding in the side panel as a read-only thread", async () => {
    const { container } = render(<AnnotatedMarkdown path="docs/guide.md" source={DOC} findings={FINDINGS} />);
    await renderedBlocks(container);

    const rail = await screen.findByTestId("comment-all-rail");

    for (const message of ["Line too long", "Heading expected", "Prefer asterisks"]) {
      expect(within(rail).getByText(new RegExp(message))).toBeInTheDocument();
    }
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByRole("button", { name: /reply/i })).toBeNull();
  });

  it("focuses the thread of a clicked block, starting at its first finding line", async () => {
    const onLineChange = vi.fn();
    const { container } = render(
      <AnnotatedMarkdown path="docs/guide.md" source={DOC} findings={FINDINGS} onLineChange={onLineChange} />,
    );
    const { paragraph } = await renderedBlocks(container);

    fireEvent.click(paragraph);

    const focused = await screen.findByTestId("comment-focused-rail");
    expect(within(focused).getByText("Heading expected")).toBeInTheDocument();
    expect(within(focused).getByText("Attached to line 3")).toBeInTheDocument();
    expect(onLineChange).toHaveBeenCalledWith(3);
  });

  it("ignores a click on a block with no findings", async () => {
    const onLineChange = vi.fn();
    const { container } = render(
      <AnnotatedMarkdown path="docs/guide.md" source={DOC} findings={FINDINGS} onLineChange={onLineChange} />,
    );
    const { heading } = await renderedBlocks(container);

    fireEvent.click(heading);

    expect(screen.queryByTestId("comment-focused-rail")).toBeNull();
    expect(onLineChange).not.toHaveBeenCalled();
  });

  it("focuses the finding on the requested line once the blocks have rendered", async () => {
    const scrollTo = vi.fn();
    const proto = HTMLElement.prototype as unknown as { scrollTo?: unknown };
    const original = proto.scrollTo;
    proto.scrollTo = scrollTo;
    try {
      const { container } = render(<AnnotatedMarkdown path="docs/guide.md" source={DOC} findings={FINDINGS} line={7} />);
      await renderedBlocks(container);

      const focused = await screen.findByTestId("comment-focused-rail");
      expect(within(focused).getByText("Prefer asterisks")).toBeInTheDocument();
      expect(scrollTo).toHaveBeenCalled();
    } finally {
      proto.scrollTo = original;
    }
  });

  it("keeps findings on the right block when an mdx file's preamble is rendered away", async () => {
    const source = ["---", "title: Guide", "---", 'import X from "./x"', "# Real heading", "", "Body."].join("\n");

    const { container } = render(
      <AnnotatedMarkdown path="docs/guide.mdx" source={source} findings={[finding(5, "error", "Bad heading")]} />,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Real heading" })).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 }).dataset.findingSeverity).toBe("error");
    });
    expect(container.querySelector("p")?.dataset.findingSeverity).toBeUndefined();
    expect(container.textContent).not.toContain("title: Guide");
  });

  it("renders host actions under each finding", async () => {
    const { container } = render(
      <AnnotatedMarkdown
        path="docs/guide.md"
        source={DOC}
        findings={[finding(3, "error", "Heading expected")]}
        renderFindingActions={(f) => <button type="button">Ignore {f.rule}</button>}
      />,
    );
    await renderedBlocks(container);

    expect(await screen.findByRole("button", { name: "Ignore MD013" })).toBeInTheDocument();
  });
});
