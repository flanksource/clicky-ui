import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { JSONPathField, type JSONPathNode } from "./JSONPathField";

function ControlledField({ onChange = vi.fn() }: { onChange?: (path: string) => void }) {
  const [value, setValue] = useState("$");
  return (
    <JSONPathField
      aria-label="Records"
      json={{ messages: [{ payload: "hello" }], "tenant-id": 7 }}
      value={value}
      onChange={(path) => {
        setValue(path);
        onChange(path);
      }}
    />
  );
}

describe("JSONPathField", () => {
  it("keeps manual editing and selects generated paths from its JSON dropdown", () => {
    const onChange = vi.fn();
    render(<ControlledField onChange={onChange} />);

    fireEvent.change(screen.getByRole("textbox", { name: "Records" }), { target: { value: "$.manual" } });
    expect(onChange).toHaveBeenLastCalledWith("$.manual");

    fireEvent.click(screen.getByRole("button", { name: "Browse Records JSON paths" }));
    fireEvent.click(screen.getByText('$["tenant-id"]'));

    expect(onChange).toHaveBeenLastCalledWith('$["tenant-id"]');
    expect(screen.getByRole("textbox", { name: "Records" })).toHaveValue('$["tenant-id"]');
    expect(document.querySelector('[data-slot="tree-picker-popup"]')).toBeNull();
  });

  it("uses consumer selection and path projection callbacks", () => {
    const onChange = vi.fn();
    render(
      <JSONPathField
        aria-label="Records"
        json={{ messages: [{ payload: "hello" }] }}
        value="$[*]"
        onChange={onChange}
        isSelectable={(node) => node.kind === "array"}
        getPath={(node: JSONPathNode) => `${node.path}[*]`}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Browse Records JSON paths" }));
    fireEvent.click(screen.getByText("$.messages"));

    expect(onChange).toHaveBeenCalledWith("$.messages[*]");
  });

  it("keeps the input editable while disabling the picker without JSON", () => {
    render(<JSONPathField aria-label="Body" value="$" onChange={vi.fn()} />);

    expect(screen.getByRole("textbox", { name: "Body" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Browse Body JSON paths" })).toBeDisabled();
  });
});
