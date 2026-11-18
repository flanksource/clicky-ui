import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InputField } from "./InputField";
import { DateField } from "./DateField";
import { Select } from "./select";
import { Combobox } from "./Combobox";
import { TreePickerField } from "./TreePickerField";

describe("in-field clearing", () => {
  it("clears a tree picker inside its trigger without selecting a node", () => {
    const onClear = vi.fn(),
      onSelect = vi.fn();
    render(
      <TreePickerField<{ id: string }>
        roots={[]}
        getKey={(node) => node.id}
        getChildren={() => undefined}
        renderRow={({ node }) => node.id}
        onSelect={onSelect}
        selected={{ id: "first" }}
        label="First"
        triggerAriaLabel="Value"
        clearable
        onClear={onClear}
      />,
    );
    const clear = screen.getByRole("button", { name: "Clear value" });
    expect(clear.closest("[data-clearable-field]")).toContainElement(
      screen.getByRole("button", { name: "Value" }),
    );
    fireEvent.click(clear);
    expect(onClear).toHaveBeenCalledOnce();
    expect(onSelect).not.toHaveBeenCalled();
  });
  it.each(["control", "menu"] as const)(
    "owns combobox clearing with search in %s",
    (searchPlacement) => {
      const onClear = vi.fn(),
        onChange = vi.fn();
      render(
        <Combobox
          ariaLabel="Value"
          value="first"
          options={[{ value: "first", label: "First" }]}
          searchPlacement={searchPlacement}
          clearable
          onClear={onClear}
          clearLabel="Clear value"
          onChange={onChange}
        />,
      );
      const clear = screen.getByRole("button", { name: "Clear value" });
      expect(clear.closest("[data-clearable-field]")).toContainElement(
        screen.getByRole("combobox", { name: "Value" }),
      );
      fireEvent.click(clear);
      expect(onClear).toHaveBeenCalledOnce();
      expect(onChange).not.toHaveBeenCalled();
    },
  );
  it.each(["text", "number", "textarea", "date", "datetime", "select"])(
    "clears %s through its own control",
    (kind) => {
      const onClear = vi.fn();
      if (kind === "select")
        render(
          <Select
            aria-label="Value"
            value="first"
            options={[{ value: "first", label: "First" }]}
            clearable
            onClear={onClear}
            onChange={vi.fn()}
          />,
        );
      else if (kind === "date" || kind === "datetime")
        render(
          <DateField
            aria-label="Value"
            mode={kind}
            value="2026-11-07"
            clearable
            onClear={onClear}
          />,
        );
      else if (kind === "textarea")
        render(
          <InputField
            as="textarea"
            aria-label="Value"
            value="Example"
            clearable
            onClear={onClear}
          />,
        );
      else
        render(
          <InputField
            aria-label="Value"
            type={kind}
            value="1"
            clearable
            onClear={onClear}
          />,
        );
      const clear = screen.getByRole("button", { name: "Clear value" });
      expect(clear.closest("[data-clearable-field]")).toContainElement(
        screen.getByLabelText("Value"),
      );
      fireEvent.click(clear);
      expect(onClear).toHaveBeenCalledOnce();
    },
  );
  it("hides clear for read-only inputs", () => {
    render(<InputField value="Example" clearable readOnly />);
    expect(
      screen.queryByRole("button", { name: "Clear value" }),
    ).not.toBeInTheDocument();
  });
});
