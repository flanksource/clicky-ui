import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ContextBadges } from "./ContextBadges";
import type { ChatContextItem, ContextTypeConfig } from "./context";

const items: ChatContextItem[] = [
  { id: "a", type: "record", label: "Order 42", fields: { total: "1.2k" } },
  { id: "b", type: "doc", label: "Q3 report" },
];

const typeConfig: ContextTypeConfig = {
  record: { className: "text-blue-600 bg-blue-50" },
};

describe("ContextBadges", () => {
  it("renders a chip per item with label and field detail", () => {
    render(<ContextBadges items={items} typeConfig={typeConfig} />);
    expect(screen.getByText("Order 42")).toBeInTheDocument();
    expect(screen.getByText("Q3 report")).toBeInTheDocument();
    expect(screen.getByText("1.2k")).toBeInTheDocument();
  });

  it("applies the per-type class from typeConfig", () => {
    render(<ContextBadges items={items} typeConfig={typeConfig} />);
    expect(screen.getByTestId("context-badge-record").className).toContain("bg-blue-50");
  });

  it("renders nothing for an empty list", () => {
    const { container } = render(<ContextBadges items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("omits remove controls when read-only (no onRemove)", () => {
    render(<ContextBadges items={items} />);
    expect(screen.queryByTestId("context-badge-remove")).not.toBeInTheDocument();
  });

  it("calls onRemove with the item id when a chip is dismissed", () => {
    const onRemove = vi.fn();
    render(<ContextBadges items={items} onRemove={onRemove} />);
    fireEvent.click(screen.getAllByTestId("context-badge-remove")[0]!);
    expect(onRemove).toHaveBeenCalledWith("a");
  });
});
