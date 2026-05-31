import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Properties, type PropertiesItem } from "./Properties";
import { UiCopy, UiZoomIn } from "../icons";

type Row = PropertiesItem<string>;

const items: Row[] = [
  { key: "namespace", value: "claims-demo" },
  { key: "pod", value: "policy-api-644b55c866-mg7tg" },
  { key: "container", value: "policy-api" },
];

describe("Properties", () => {
  it("renders one row per visible item with default label formatting", () => {
    render(<Properties items={items} />);

    expect(screen.getByText("Namespace")).toBeInTheDocument();
    expect(screen.getByText("Pod")).toBeInTheDocument();
    expect(screen.getByText("Container")).toBeInTheDocument();
    expect(screen.getByText("claims-demo")).toBeInTheDocument();
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
            icon: UiZoomIn,
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
});
