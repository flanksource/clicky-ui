import { fireEvent, render, screen } from "@testing-library/react";
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

  it("stacks one instance of each pane and hides the resize handle on mobile", () => {
    render(
      <SplitPane
        stackOnMobile
        defaultSplit={40}
        left={<div data-testid="left">L</div>}
        right={<div data-testid="right">R</div>}
      />,
    );

    const left = screen.getByTestId("left").parentElement!;
    const right = screen.getByTestId("right").parentElement!;
    expect(left).toHaveClass("w-full", "md:w-[var(--split-pane-width)]");
    expect(right).toHaveClass("w-full", "md:w-[var(--split-pane-width)]");
    expect(left.style.getPropertyValue("--split-pane-width")).toBe("40%");
    expect(right.style.getPropertyValue("--split-pane-width")).toBe("60%");
    const separator = screen.getByRole("separator");
    expect(separator).toHaveClass("hidden", "md:block");
    expect(separator.parentElement).toHaveClass("flex-col", "md:flex-row");
    expect(screen.getAllByTestId("left")).toHaveLength(1);
    expect(screen.getAllByTestId("right")).toHaveLength(1);

    separator.parentElement!.getBoundingClientRect = () =>
      ({ left: 0, width: 100 } as DOMRect);
    fireEvent.mouseDown(separator);
    fireEvent.mouseMove(document, { clientX: 55 });
    fireEvent.mouseUp(document);

    expect(parseFloat(left.style.getPropertyValue("--split-pane-width"))).toBeCloseTo(55);
    expect(parseFloat(right.style.getPropertyValue("--split-pane-width"))).toBeCloseTo(45);
  });
});
