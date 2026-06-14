import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Timeline, type TimelineItem } from "./Timeline";

const ITEMS: TimelineItem[] = [
  { id: 1, actor: "aditya", action: "opened this pull request", timestamp: "3d ago" },
  { id: 2, actor: "moshe", action: "approved these changes", timestamp: "1d ago" },
  {
    id: 3,
    actor: "yash",
    action: "commented",
    timestamp: "1d ago",
    bodyHeader: <span>reconnect.go:42</span>,
    body: "Debounce the SSE reconnect.",
  },
];

describe("Timeline", () => {
  it("renders one row per event", () => {
    const { container } = render(<Timeline items={ITEMS} />);
    expect(container.querySelectorAll("li")).toHaveLength(ITEMS.length);
  });

  it("renders actor, action and timestamp", () => {
    render(<Timeline items={ITEMS} />);
    expect(screen.getByText("aditya")).toBeInTheDocument();
    expect(screen.getByText("opened this pull request")).toBeInTheDocument();
    expect(screen.getByText("· 3d ago")).toBeInTheDocument();
  });

  it("renders the body bubble and its header when provided", () => {
    render(<Timeline items={ITEMS} />);
    expect(screen.getByText("Debounce the SSE reconnect.")).toBeInTheDocument();
    expect(screen.getByText("reconnect.go:42")).toBeInTheDocument();
  });

  it("draws a connector rail on every row except the last", () => {
    const { container } = render(<Timeline items={ITEMS} />);
    const rails = container.querySelectorAll('span[aria-hidden="true"]');
    expect(rails).toHaveLength(ITEMS.length - 1);
  });
});
