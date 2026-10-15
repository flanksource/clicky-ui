import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CodeLine } from "./CodeLine";
import { ThemeContext } from "../hooks/use-theme";

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
    expect(mockHighlight).toHaveBeenCalledWith(JAVA_LINE, { lang: "java", theme: "github-light" });
    expect(screen.getByText("return").closest("code")).toHaveTextContent(JAVA_LINE);
  });

  it("renders the plain line when it cannot be tokenized", async () => {
    render(<CodeLine code={JAVA_LINE} />);
    await waitFor(() => expect(mockHighlight).toHaveBeenCalled());
    expect(screen.getByText(JAVA_LINE).tagName).toBe("CODE");
  });

  it("formats with the surrounding dark theme", async () => {
    render(<ThemeContext.Provider value={{ theme: "dark", resolvedTheme: "dark", setTheme: vi.fn() }}>
      <CodeLine code={JAVA_LINE} language="java" />
    </ThemeContext.Provider>);
    await waitFor(() => expect(mockHighlight).toHaveBeenCalledWith(JAVA_LINE, { lang: "java", theme: "github-dark" }));
  });

  it("reformats existing source when the surrounding theme changes", async () => {
    const light = { theme: "light", resolvedTheme: "light", setTheme: vi.fn() } as const;
    const dark = { ...light, theme: "dark", resolvedTheme: "dark" } as const;
    const { rerender } = render(<ThemeContext.Provider value={light}>
      <CodeLine code={JAVA_LINE} language="java" />
    </ThemeContext.Provider>);
    await waitFor(() => expect(mockHighlight).toHaveBeenLastCalledWith(JAVA_LINE, { lang: "java", theme: "github-light" }));
    rerender(<ThemeContext.Provider value={dark}>
      <CodeLine code={JAVA_LINE} language="java" />
    </ThemeContext.Provider>);
    await waitFor(() => expect(mockHighlight).toHaveBeenLastCalledWith(JAVA_LINE, { lang: "java", theme: "github-dark" }));
    expect(screen.getByText(JAVA_LINE)).toHaveTextContent(JAVA_LINE);
  });
});
