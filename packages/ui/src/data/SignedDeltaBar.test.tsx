import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SignedDeltaBar } from "./SignedDeltaBar";

function bar(container: HTMLElement): HTMLElement {
  // The meter has the center tick (first child) and the fill (second child).
  const fill = container.querySelector('[role="meter"] > div:nth-child(2)');
  if (!(fill instanceof HTMLElement)) throw new Error("delta fill not found");
  return fill;
}

describe("SignedDeltaBar", () => {
  it("grows right from center for a positive value", () => {
    const { container } = render(<SignedDeltaBar value={20} max={50} />);
    expect(bar(container).style.left).toBe("50%");
    expect(bar(container).style.width).toBe("20%"); // (20/50)*50
  });

  it("grows left from center for a negative value", () => {
    const { container } = render(<SignedDeltaBar value={-10} max={50} />);
    expect(bar(container).style.right).toBe("50%");
    expect(bar(container).style.width).toBe("10%"); // (10/50)*50
  });

  it("clamps magnitude to max", () => {
    const { container } = render(<SignedDeltaBar value={500} max={50} />);
    expect(bar(container).style.width).toBe("50%");
  });

  it("colors positive green and negative red by default", () => {
    const { container: pos } = render(<SignedDeltaBar value={5} />);
    expect(bar(pos).className).toMatch(/bg-green-500/);
    const { container: neg } = render(<SignedDeltaBar value={-5} />);
    expect(bar(neg).className).toMatch(/bg-red-500/);
  });

  it("flips direction colors when positiveIsBad is set", () => {
    const { container: pos } = render(<SignedDeltaBar value={5} positiveIsBad />);
    expect(bar(pos).className).toMatch(/bg-red-500/);
    const { container: neg } = render(<SignedDeltaBar value={-5} positiveIsBad />);
    expect(bar(neg).className).toMatch(/bg-green-500/);
  });

  it("mutes the bar when not significant", () => {
    const { container } = render(<SignedDeltaBar value={20} significant={false} />);
    expect(bar(container).className).toMatch(/bg-muted-foreground/);
    expect(bar(container).className).not.toMatch(/bg-green-500|bg-red-500/);
  });

  it("renders a signed percentage label by default", () => {
    const { getByText: pos } = render(<SignedDeltaBar value={3.5} />);
    expect(pos("+3.50%")).toBeInTheDocument();
    const { getByText: neg } = render(<SignedDeltaBar value={-3.5} />);
    expect(neg("-3.50%")).toBeInTheDocument();
  });

  it("uses a custom formatter when provided", () => {
    const { getByText } = render(
      <SignedDeltaBar value={12} format={(v) => `${v}ms`} />,
    );
    expect(getByText("12ms")).toBeInTheDocument();
  });
});
