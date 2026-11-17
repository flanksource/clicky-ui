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

  it.each([
    [6, 4, "3"],
    [5, 4, "4"],
    [8, 4, "1"],
    [3, 2, "2"],
  ])("stretches the last of %i cells over what %i columns leave empty in its row", (count, columns, span) => {
    const many = Array.from({ length: count }, (_, i) => ({ label: `Stat ${i + 1}`, value: String(i) }));
    render(<StatStrip items={many} columns={columns} />);
    expect(screen.getByTestId("stat-strip").firstElementChild).toHaveStyle({ "--stat-last-span": span });
  });

  it("renders an actionable item as a button", () => {
    const onClick = vi.fn();
    render(<StatStrip items={[{ label: "Ready", value: "5", onClick }]} />);

    fireEvent.click(screen.getByRole("button", { name: /Ready/ }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
