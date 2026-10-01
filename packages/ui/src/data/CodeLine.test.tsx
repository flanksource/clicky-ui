import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CodeLine } from "./CodeLine";

vi.mock("./code-highlight", () => ({
  highlightToLines: vi.fn(async () => null),
}));
import { highlightToLines } from "./code-highlight";
const mockHighlight = vi.mocked(highlightToLines);

const JAVA_LINE = "return this.process(activity);";
const KEYWORD_COLOR = "#d73a49";

beforeEach(() => {
  mockHighlight.mockReset();
  mockHighlight.mockResolvedValue(null);
});

describe("CodeLine", () => {
  it("paints the line as themed tokens in its language", async () => {
    mockHighlight.mockResolvedValue([
      [
        { content: "return", color: KEYWORD_COLOR },
        { content: " this.process(activity);" },
      ],
    ]);
    render(<CodeLine code={JAVA_LINE} language="java" />);
    await waitFor(() => expect(screen.getByText("return")).toHaveStyle({ color: KEYWORD_COLOR }));
    expect(mockHighlight).toHaveBeenCalledWith(JAVA_LINE, { lang: "java" });
    expect(screen.getByText("return").closest("code")).toHaveTextContent(JAVA_LINE);
  });

  it("renders the plain line when it cannot be tokenized", async () => {
    render(<CodeLine code={JAVA_LINE} />);
    await waitFor(() => expect(mockHighlight).toHaveBeenCalled());
    expect(screen.getByText(JAVA_LINE).tagName).toBe("CODE");
  });
});
