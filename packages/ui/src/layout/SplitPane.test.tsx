import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SplitPane } from "./SplitPane";

describe("SplitPane", () => {
  it("renders both panes with defaultSplit widths", () => {
    render(
      <SplitPane
        defaultSplit={40}
        left={<div data-testid="left">L</div>}
        right={<div data-testid="right">R</div>}
      />,
    );
    const left = screen.getByTestId("left").parentElement!;
    const right = screen.getByTestId("right").parentElement!;
    expect(left.style.width).toBe("40%");
    expect(right.style.width).toBe("60%");
  });

  it("defaults to 50/50 split", () => {
    render(
      <SplitPane left={<span data-testid="l">l</span>} right={<span data-testid="r">r</span>} />,
    );
    const left = screen.getByTestId("l").parentElement!;
    expect(left.style.width).toBe("50%");
  });

  it("exposes a separator for a11y", () => {
    render(<SplitPane left={<div />} right={<div />} />);
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAttribute("aria-orientation", "vertical");
  });
});
