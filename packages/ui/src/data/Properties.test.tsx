import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Properties, type PropertiesItem } from "./Properties";
import { UiChevronRight, UiCopy } from "../icons";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

type Row = PropertiesItem<string>;

const items: Row[] = [
  { key: "namespace", value: "claims-demo" },
  { key: "pod", value: "policy-api-644b55c866-mg7tg" },
  { key: "container", value: "policy-api" },
];

function namespaceRow(): HTMLElement {
  const row = screen.getByText("Namespace").closest(".grid");
  if (!row) throw new Error("namespace property row not found");
  return row as HTMLElement;
}

describe("Properties", () => {
  beforeEach(() => localStorage.clear());

  it("renders typed bytes, durations and percentages with their raw values available", () => {
    render(<Properties items={[
      { key: "memory", value: 1048576, type: "bytes" },
      { key: "elapsed", value: 1500, type: "duration", unit: "ms" },
      { key: "load", value: 0.5, type: "number", unit: "percentunit" },
      { key: "unsupported", value: -1, type: "bytes" },
    ]} />);
    expect(screen.getByText("1 MB")).toHaveAttribute("title", "1048576");
    expect(screen.getByText("1.5 s")).toHaveAttribute("title", "1500");
    expect(screen.getByText("50%")).toHaveAttribute("title", "0.5");
    expect(screen.getByText("-1 B")).toBeInTheDocument();
  });

  it("renders expandable structured values and explicitly typed JSON strings", () => {
    const { container } = render(<Properties items={[
      { key: "usage", value: { used: 1024, pools: ["heap"] } },
      { key: "config", value: '{"enabled":false}', type: "json" },
      { key: "literal", value: '{"message":"literal"}' },
      { key: "empty", value: null },
    ]} />);
    expect(container.querySelectorAll('[data-format="json"]')).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Collapse value" })).toHaveLength(2);
    expect(screen.getByText("false")).toBeInTheDocument();
    expect(screen.getByText('{"message":"literal"}')).toBeInTheDocument();
    expect(screen.getByText("null")).toBeInTheDocument();
  });

  it("preserves false and zero values and renders timestamp values as dates", () => {
    render(<Properties items={[
      { key: "enabled", value: false, type: "boolean" },
      { key: "count", value: 0, type: "number" },
      { key: "started", value: 1704067200000, type: "date" },
    ]} />);
    expect(screen.getByText("false")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("2024-01-01T00:00:00.000Z")).toHaveAttribute("dateTime", "2024-01-01T00:00:00.000Z");
  });

  it("rejects invalid numeric values instead of rendering them as zero bytes", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<Properties items={[{ key: "memory", value: Number.NaN, type: "bytes" }]} />))
        .toThrow("Property memory: expected a finite numeric value for bytes");
    } finally {
      error.mockRestore();
    }
  });

  it("renders one row per visible item with default label formatting", () => {
    render(<Properties items={items} />);

    expect(screen.getByText("Namespace")).toBeInTheDocument();
    expect(screen.getByText("Pod")).toBeInTheDocument();
    expect(screen.getByText("Container")).toBeInTheDocument();
    expect(screen.getByText("claims-demo")).toBeInTheDocument();
  });

  it("uses the spacious row and label layout", () => {
    render(<Properties items={items} density="spacious" />);

    const row = namespaceRow();
    expect(row).toHaveClass("px-density-4", "py-density-3");
    expect(row.closest("dl")).toHaveStyle({
      gridTemplateColumns: "minmax(12rem, 20rem) minmax(0, 1fr)",
    });
    expect(row).toHaveClass("grid-cols-subgrid");
    expect(row?.querySelector("dt")).toHaveClass("text-sm");
  });

  it("changes density from the properties menu without persisting when keyRef is absent", () => {
    render(<Properties items={items} density="spacious" />);

    fireEvent.click(screen.getByRole("button", { name: "Properties options" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Compact" }));

    expect(namespaceRow()).toHaveClass("px-density-2", "py-density-1.5");
    expect(localStorage).toHaveLength(0);
  });

  it("restores density persisted by clicky-ui when keyRef is provided", () => {
    const { unmount } = render(
      <Properties
        items={items}
        density="spacious"
        keyRef="runtime-settings:tenant-x"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Properties options" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Compact" }));
    expect(
      localStorage.getItem(
        "clicky-ui-properties:runtime-settings:tenant-x:density",
      ),
    ).toBe("compact");

    unmount();
    render(
      <Properties
        items={items}
        density="spacious"
        keyRef="runtime-settings:tenant-x"
      />,
    );
    expect(namespaceRow()).toHaveClass("px-density-2", "py-density-1.5");
  });

  it("omits hidden items", () => {
    render(
      <Properties
        items={[...items, { key: "secret", value: "shh", hidden: true }]}
      />,
    );

    expect(screen.queryByText("Secret")).not.toBeInTheDocument();
    expect(screen.queryByText("shh")).not.toBeInTheDocument();
  });

  it("shows the empty message when every item is hidden", () => {
    render(
      <Properties
        items={[{ key: "x", value: "y", hidden: true }]}
        emptyMessage="nothing"
      />,
    );
    expect(screen.getByText("nothing")).toBeInTheDocument();
  });

  it("uses custom renderLabel and renderValue with (key, value, item) context", () => {
    const renderLabel = vi.fn((key: string) => `L:${key}`);
    const renderValue = vi.fn((_key: string, value: string) => `V:${value}`);
    render(
      <Properties
        items={[{ key: "namespace", value: "demo" }]}
        renderLabel={renderLabel}
        renderValue={renderValue}
      />,
    );

    expect(screen.getByText("L:namespace")).toBeInTheDocument();
    expect(screen.getByText("V:demo")).toBeInTheDocument();
    expect(renderLabel).toHaveBeenCalledWith(
      "namespace",
      "demo",
      expect.objectContaining({ key: "namespace" }),
    );
  });

  it("lets custom values fill the available value column", () => {
    render(
      <Properties
        items={[{ key: "enabled", value: "true" }]}
        renderValue={() => <div data-testid="custom-value">value</div>}
      />,
    );

    expect(screen.getByTestId("custom-value").parentElement).toHaveClass(
      "flex-1",
    );
  });

  it("invokes suffix action onClick with (key, value, item)", () => {
    const onClick = vi.fn();
    render(
      <Properties
        items={[{ key: "namespace", value: "demo" }]}
        suffixActions={[
          {
            id: "copy",
            icon: UiCopy,
            label: (key) => `Copy ${key}`,
            onClick,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByLabelText("Copy namespace"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(
      "namespace",
      "demo",
      expect.objectContaining({ key: "namespace" }),
    );
  });

  it("hides actions whose visible() returns false and disables when disabled() returns true", () => {
    render(
      <Properties
        items={[
          {
            key: "expandable-row",
            value: "v",
            expandable: true,
            expanded: false,
          },
          { key: "scalar-row", value: "v" },
        ]}
        prefixActions={[
          {
            id: "expand",
            icon: UiChevronRight,
            label: (key) => `Expand ${key}`,
            visible: (_k, _v, item) => !!item.expandable,
            disabled: (_k, _v, item) => !!item.expanded,
            onClick: () => {},
          },
        ]}
      />,
    );

    expect(screen.getByLabelText("Expand expandable-row")).not.toBeDisabled();
    expect(
      screen.queryByLabelText("Expand scalar-row"),
    ).not.toBeInTheDocument();
  });

  it("renders renderChildren only when expandable && expanded", () => {
    const { rerender } = render(
      <Properties
        items={[
          {
            key: "tags",
            value: "v",
            expandable: true,
            expanded: false,
            renderChildren: () => <div data-testid="children">children</div>,
          },
        ]}
      />,
    );
    expect(screen.queryByTestId("children")).not.toBeInTheDocument();

    rerender(
      <Properties
        items={[
          {
            key: "tags",
            value: "v",
            expandable: true,
            expanded: true,
            renderChildren: () => <div data-testid="children">children</div>,
          },
        ]}
      />,
    );
    expect(screen.getByTestId("children")).toBeInTheDocument();
    expect(screen.getByTestId("children").closest("dd")).toHaveClass(
      "col-span-full",
    );
    expect(
      screen.getByTestId("children").closest("dd")?.previousElementSibling,
    ).toHaveClass("sr-only");
  });

  it("renders a labelIcon when provided as a string", () => {
    const { container } = render(
      <Properties
        items={[{ key: "namespace", value: "demo" }]}
        labelIcon="k8s-namespace"
      />,
    );
    expect(
      container.querySelector('[title="k8s-namespace"]'),
    ).toBeInTheDocument();
  });

  it("inherits parent tracks and indents nested labels without indenting values", () => {
    render(
      <Properties
        gridTemplateColumns="fit-content(30ch) minmax(0, 1fr)"
        items={[
          {
            key: "parent",
            value: "group",
            expandable: true,
            expanded: true,
            renderChildren: () => (
              <Properties
                density="spacious"
                items={[{ key: "child", value: "nested" }]}
              />
            ),
          },
        ]}
      />,
    );
    const child = screen.getByText("Child").closest("dt");
    expect(child).toHaveStyle({ paddingInlineStart: "16px" });
    expect(child?.closest("dl")).toHaveStyle({
      gridTemplateColumns: "subgrid",
    });
    expect(screen.getByText("nested").closest("dd")).not.toHaveAttribute(
      "style",
    );
    expect(
      screen.getAllByRole("button", { name: "Properties options" }),
    ).toHaveLength(1);
  });
});
