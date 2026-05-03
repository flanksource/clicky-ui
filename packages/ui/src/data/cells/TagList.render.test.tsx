import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TagList, normalizeTags } from "./TagList";

describe("TagList", () => {
  it("hides overflow tags until the +N trigger is hovered", () => {
    vi.useFakeTimers();
    const tags = normalizeTags([
      "env=prod",
      "tier=edge",
      "region=us-east",
      "team=platform",
      "owner=ops",
    ]);

    render(<TagList tags={tags} maxVisible={2} />);

    // Split label/value badges render the key and value in separate spans;
    // assert each side independently.
    expect(screen.getByText("env")).toBeInTheDocument();
    expect(screen.getByText("prod")).toBeInTheDocument();
    expect(screen.getByText("tier")).toBeInTheDocument();
    expect(screen.getByText("edge")).toBeInTheDocument();
    expect(screen.queryByText("region")).not.toBeInTheDocument();
    expect(screen.queryByText("team")).not.toBeInTheDocument();
    expect(screen.queryByText("owner")).not.toBeInTheDocument();

    const overflowBadge = screen.getByText("+3");
    expect(overflowBadge).toBeInTheDocument();

    // HoverCard listens on the outer wrapper, not the badge itself.
    const hoverWrapper = overflowBadge.closest("span.relative");
    expect(hoverWrapper).not.toBeNull();

    fireEvent.mouseEnter(hoverWrapper!);

    expect(screen.getByText("region")).toBeInTheDocument();
    expect(screen.getByText("us-east")).toBeInTheDocument();
    expect(screen.getByText("team")).toBeInTheDocument();
    expect(screen.getByText("platform")).toBeInTheDocument();
    expect(screen.getByText("owner")).toBeInTheDocument();
    expect(screen.getByText("ops")).toBeInTheDocument();

    fireEvent.mouseLeave(hoverWrapper!);
    // Grace period: card stays open briefly so the cursor can cross the gap
    // to the portaled body. Advance past it to assert the close.
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.queryByText("region")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("does not render the +N trigger as a copy button", () => {
    const tags = normalizeTags(["a=1", "b=2", "c=3", "d=4"]);
    render(<TagList tags={tags} maxVisible={2} />);

    const overflow = screen.getByText("+2");
    // The trigger should be a plain span, not the copy <button> that Badge
    // renders when clickToCopy is enabled.
    const buttonAncestor = overflow.closest("button");
    expect(buttonAncestor).toBeNull();
  });
});
