import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnsiHtml } from "./AnsiHtml";

describe("AnsiHtml", () => {
  it("renders plain text with no escapes", () => {
    render(<AnsiHtml text="hello world" />);
    expect(screen.getByText("hello world")).toBeInTheDocument();
  });

  it("applies color from escape code", () => {
    const { container } = render(<AnsiHtml text={"\x1b[31mred\x1b[0m"} />);
    const pre = container.querySelector("pre")!;
    expect(pre.textContent).toContain("red");
    // At least one span inside should carry a style attribute with a color.
    const styled = Array.from(pre.querySelectorAll("span")).find(
      (s) => (s as HTMLElement).style.color !== "",
    );
    expect(styled).toBeDefined();
    expect((styled as HTMLElement).textContent).toBe("red");
  });

  it("resets styles on \\x1b[0m", () => {
    const { container } = render(<AnsiHtml text={"\x1b[31mA\x1b[0mB"} />);
    const spans = Array.from(container.querySelectorAll("span"));
    const b = spans.find((s) => s.textContent === "B") as HTMLElement;
    expect(b).toBeDefined();
    expect(b.style.color).toBe("");
  });

  it("renders as span when as='span'", () => {
    const { container } = render(<AnsiHtml text="x" as="span" />);
    expect(container.querySelector("pre")).toBeNull();
  });

  it("renders Clicky truecolor without interpreting RGB channels as SGR styles", () => {
    render(<AnsiHtml text={"\x1b[1;38;2;34;197;94mrecorded\x1b[0m"} />);
    expect(screen.getByText("recorded")).toHaveStyle({
      color: "rgb(34, 197, 94)",
      fontWeight: "bold",
    });
    expect(screen.getByText("recorded").style.opacity).toBe("");
  });

  it("renders indexed foreground and truecolor background", () => {
    render(<AnsiHtml text={"\x1b[38;5;196;48;2;17;24;39mindexed\x1b[0m"} />);
    expect(screen.getByText("indexed")).toHaveStyle({
      color: "rgb(255, 0, 0)",
      backgroundColor: "rgb(17, 24, 39)",
    });
  });

  it("resets foreground and intensity independently and treats empty SGR as reset", () => {
    render(
      <AnsiHtml
        text={"\x1b[1;2;31mfirst\x1b[39;22msecond\x1b[32mthird\x1b[mlast"}
      />,
    );
    expect(screen.getByText("second").style.cssText).toBe("");
    expect(screen.getByText("third").style.color).not.toBe("");
    expect(screen.getByText("last").style.cssText).toBe("");
  });
});
