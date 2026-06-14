import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SegmentedControl, type SegmentedOption } from "./SegmentedControl";

const OPTIONS: SegmentedOption[] = [
  { id: "me", label: "Mine" },
  { id: "all", label: "All" },
  { id: "bots", label: "Bots" },
];

function Controlled({ initial = "all" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return <SegmentedControl aria-label="Scope" value={value} onChange={setValue} options={OPTIONS} />;
}

describe("SegmentedControl", () => {
  it("marks the selected option via aria-checked", () => {
    render(<Controlled initial="all" />);
    expect(screen.getByRole("radio", { name: "All" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Mine" })).toHaveAttribute("aria-checked", "false");
  });

  it("emits the clicked option id", () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl aria-label="Scope" value="all" onChange={onChange} options={OPTIONS} />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Mine" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith("me");
  });

  it("moves selection to the next option on ArrowRight", () => {
    const onChange = vi.fn();
    render(<SegmentedControl aria-label="Scope" value="me" onChange={onChange} options={OPTIONS} />);
    fireEvent.keyDown(screen.getByRole("radio", { name: "Mine" }), { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledExactlyOnceWith("all");
  });

  it("does not emit for a disabled option", () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        aria-label="Range"
        value="day"
        onChange={onChange}
        options={[
          { id: "day", label: "Day" },
          { id: "week", label: "Week", disabled: true },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Week" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
