import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { FrameSourceWindow } from "./FrameSourceWindow";
import { highlightToLines } from "../code-highlight";

vi.mock("../code-highlight", () => ({
  // One token per line, coloured — enough to assert that highlighting ran and
  // that the text survived tokenization intact.
  highlightToLines: vi.fn(async (source: string) =>
    source.split("\n").map((line) => [{ content: line, color: "#ff0000" }]),
  ),
}));

const mockHighlight = vi.mocked(highlightToLines);

describe("FrameSourceWindow", () => {
  beforeEach(() => {
    mockHighlight.mockClear();
  });

  // arthas `jad` returns bytecode-keyed line numbers with gaps, so the gutter is
  // painted from sourceLineNumbers rather than counted from sourceStartLine. A
  // renderer that assumed a contiguous run would silently renumber these.
  it("paints non-contiguous line numbers verbatim and marks the focal line", async () => {
    const { container } = render(
      <FrameSourceWindow
        frame={{
          sourceLines: ["int a = 1;", "throw new RuntimeException();", "return a;"],
          sourceLineNumbers: [17, 42, 108],
          line: 42,
        }}
      />,
    );
    await waitFor(() => expect(container.querySelector('span[style*="color"]')).not.toBeNull());
    expect(screen.getByText("17")).toBeInTheDocument();
    expect(screen.getByText("108")).toBeInTheDocument();
    expect(screen.getByText(/^>42$/)).toBeInTheDocument();
  });

  // Regression: highlighting used to be skipped entirely whenever
  // sourceLineNumbers was set — which is always true for arthas-decompiled
  // frames, so decompiled Java was never highlighted.
  it("still highlights when explicit line numbers are present", async () => {
    const { container } = render(
      <FrameSourceWindow
        frame={{
          sourceLines: ["throw new RuntimeException();"],
          sourceLineNumbers: [42],
          line: 42,
        }}
      />,
    );
    await waitFor(() => {
      expect(container.querySelector('span[style*="color"]')).not.toBeNull();
    });
    expect(screen.getByText("throw new RuntimeException();")).toBeInTheDocument();
  });

  // A decompiled row the line table does not map has no original line. Painting
  // its 0 would read as a line number; a blank says there is none.
  it("leaves the gutter blank for a line whose number is unknown", async () => {
    const { container } = render(
      <FrameSourceWindow
        frame={{ sourceLines: ["try {", "run();"], sourceLineNumbers: [0, 42], line: 42 }}
      />,
    );
    await waitFor(() => expect(container.querySelector('span[style*="color"]')).not.toBeNull());
    const gutter = screen.getByText("try {").closest("div")!.querySelector("span.select-none")!;
    expect(gutter.textContent).toBe("");
    expect(screen.getByText(/^>42$/)).toBeInTheDocument();
  });

  it("falls back to sourceStartLine when no explicit numbers are given", async () => {
    const { container } = render(
      <FrameSourceWindow
        frame={{ sourceLines: ["a", "b"], sourceStartLine: 10, line: 11 }}
      />,
    );
    await waitFor(() => expect(container.querySelector('span[style*="color"]')).not.toBeNull());
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText(/^>11$/)).toBeInTheDocument();
  });

  it("renders nothing without source lines", () => {
    const { container } = render(<FrameSourceWindow frame={{ line: 42 }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("defaults to the error focal styling with red text", async () => {
    const { container } = render(
      <FrameSourceWindow frame={{ sourceLines: ["a"], sourceStartLine: 1, line: 1 }} />,
    );
    await waitFor(() => expect(container.querySelector('span[style*="color"]')).not.toBeNull());
    const focalRow = screen.getByText("a").closest("div")!;
    expect(focalRow.className).toMatch(/text-red-800/);
    expect(focalRow.className).toMatch(/bg-red-500\/10/);
  });

  it("uses a neutral, theme-token highlight with no red styling when focalTone is 'neutral'", async () => {
    const { container } = render(
      <FrameSourceWindow
        frame={{ sourceLines: ["a"], sourceStartLine: 1, line: 1 }}
        focalTone="neutral"
      />,
    );
    await waitFor(() => expect(container.querySelector('span[style*="color"]')).not.toBeNull());
    const focalRow = screen.getByText("a").closest("div")!;
    expect(focalRow.className).not.toMatch(/red/);
    expect(focalRow.className).toMatch(/bg-primary/);
  });

  // This window is shared by JVM frames, exception frames and frameless callers.
  // Defaulting an absent language to "java" coloured Go dumps and template errors
  // with Java grammar — wrong rather than merely absent.
  it("passes the frame's language through and never substitutes a default", async () => {
    const { rerender } = render(
      <FrameSourceWindow frame={{ sourceLines: ["func main() {}"], sourceStartLine: 1 }} />,
    );
    await waitFor(() => expect(mockHighlight).toHaveBeenCalled());
    expect(mockHighlight.mock.calls[0]?.[1]).toEqual({ lang: undefined });

    mockHighlight.mockClear();
    rerender(
      <FrameSourceWindow
        frame={{ sourceLines: ["func main() {}"], sourceStartLine: 1, sourceLanguage: "go" }}
      />,
    );
    await waitFor(() => expect(mockHighlight).toHaveBeenCalled());
    expect(mockHighlight.mock.calls[0]?.[1]).toEqual({ lang: "go" });
  });
});
