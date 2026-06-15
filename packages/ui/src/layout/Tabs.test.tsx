import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Tabs, type TabItem } from "./Tabs";

const tabs: TabItem[] = [
  { id: "a", label: "Alpha" },
  { id: "b", label: "Beta", count: 2 },
];

describe("Tabs", () => {
  it("marks the active tab and fires onChange when another tab is clicked", () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} value="a" onChange={onChange} />);
    expect(screen.getByRole("tab", { name: /Alpha/ }).getAttribute("aria-selected")).toBe("true");
    fireEvent.click(screen.getByRole("tab", { name: /Beta/ }));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("does not fire onChange for a disabled tab", () => {
    const onChange = vi.fn();
    render(
      <Tabs
        tabs={[
          { id: "a", label: "Alpha" },
          { id: "b", label: "Beta", disabled: true },
        ]}
        value="a"
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: /Beta/ }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
