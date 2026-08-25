import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UiLock } from "../icons";
import { SegmentedControl, type SegmentedOption } from "./SegmentedControl";

const OPTIONS: SegmentedOption[] = [
  { id: "me", label: "Mine" },
  { id: "all", label: "All" },
  { id: "bots", label: "Bots" },
];

function Controlled({ initial = "all" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <SegmentedControl
      aria-label="Scope"
      value={value}
      onChange={setValue}
      options={OPTIONS}
    />
  );
}

describe("SegmentedControl", () => {
  it("uses the density control height for the default md track", () => {
    render(<Controlled initial="all" />);
    expect(screen.getByRole("radiogroup", { name: "Scope" })).toHaveClass(
      "h-control-h",
    );
  });

  it("keeps sm as an explicit compact segmented control", () => {
    render(
      <SegmentedControl
        aria-label="Scope"
        value="all"
        onChange={() => {}}
        options={OPTIONS}
        size="sm"
      />,
    );
    expect(screen.getByRole("radiogroup", { name: "Scope" })).not.toHaveClass(
      "h-control-h",
    );
  });

  it("marks the selected option via aria-checked", () => {
    render(<Controlled initial="all" />);
    expect(screen.getByRole("radio", { name: "All" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "Mine" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("emits the clicked option id", () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        aria-label="Scope"
        value="all"
        onChange={onChange}
        options={OPTIONS}
      />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Mine" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith("me");
  });

  it("moves selection to the next option on ArrowRight", () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        aria-label="Scope"
        value="me"
        onChange={onChange}
        options={OPTIONS}
      />,
    );
    fireEvent.keyDown(screen.getByRole("radio", { name: "Mine" }), {
      key: "ArrowRight",
    });
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

  it("renders large wrapped options with descriptions", () => {
    render(
      <SegmentedControl
        aria-label="Permission preset"
        value="edit"
        onChange={() => {}}
        size="lg"
        wrap
        options={[
          {
            id: "edit",
            label: "Edit",
            description: "Edits auto, shell asks.",
          },
          {
            id: "plan",
            label: "Plan",
            description: "Writes off.",
          },
        ]}
      />,
    );

    expect(screen.getByRole("radio", { name: /Edit/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByText("Edits auto, shell asks.")).toBeInTheDocument();
    expect(screen.getByText("Edits auto, shell asks.")).not.toHaveClass(
      "truncate",
    );
    expect(screen.getByText("Edits auto, shell asks.")).toHaveClass(
      "whitespace-normal",
    );
    expect(
      screen.getByRole("radiogroup", { name: "Permission preset" }),
    ).toHaveClass("flex-wrap");
  });

  it("applies option icon and active styling without coloring inactive segments", () => {
    render(
      <SegmentedControl
        aria-label="Access"
        value="read"
        onChange={() => {}}
        options={[
          {
            id: "read",
            label: "Read only",
            icon: UiLock,
            iconClassName: "text-sky-700",
            activeClassName: "border-sky-500 bg-sky-100",
          },
          {
            id: "full",
            label: "Full access",
            activeClassName: "border-rose-500 bg-rose-100",
          },
        ]}
      />,
    );

    const selected = screen.getByRole("radio", { name: "Read only" });
    expect(selected).toHaveClass("border-sky-500", "bg-sky-100");
    expect(selected.querySelector("svg")).toHaveClass("text-sky-700");
    expect(screen.getByRole("radio", { name: "Full access" })).not.toHaveClass(
      "border-rose-500",
      "bg-rose-100",
    );
  });
});
