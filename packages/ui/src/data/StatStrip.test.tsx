import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { StatStrip } from "./StatStrip";

const items = [
  { label: "Open requests", value: "7", sub: "Awaiting a decision" },
  { label: "Held", value: "2", sub: "Blocked or needs review", tone: "warning" as const },
];

describe("StatStrip", () => {
  it("renders a label, value and sub-label per item", () => {
    render(<StatStrip items={items} />);

    expect(screen.getByText("Open requests")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Awaiting a decision")).toBeInTheDocument();
    expect(screen.getByText("Blocked or needs review")).toBeInTheDocument();
  });

  it("tones the value without toning the label", () => {
    render(<StatStrip items={items} />);

    expect(screen.getByText("2").className).toContain("text-amber-600");
    expect(screen.getByText("Held").parentElement?.className).toContain(
      "text-muted-foreground",
    );
  });

  it("defaults the column count to the number of items", () => {
    const { rerender } = render(<StatStrip items={items} />);
    const grid = () => screen.getByTestId("stat-strip").firstElementChild;

    expect(grid()).toHaveStyle({ "--stat-cols": "2" });

    rerender(<StatStrip items={items} columns={4} />);
    expect(grid()).toHaveStyle({ "--stat-cols": "4" });
  });

  it("renders an actionable item as a button", () => {
    const onClick = vi.fn();
    render(<StatStrip items={[{ label: "Ready", value: "5", onClick }]} />);

    fireEvent.click(screen.getByRole("button", { name: /Ready/ }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
