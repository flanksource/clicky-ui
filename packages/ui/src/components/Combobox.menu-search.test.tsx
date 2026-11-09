import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Combobox } from "./Combobox";

const OPTIONS = [
  { value: "model-a", label: "First model", group: "Provider A" },
  { value: "model-b", label: "Second model", group: "Provider B" },
];

describe("Combobox menu filter", () => {
  it("keeps header actions outside the listbox when search has no matches", () => {
    const create = vi.fn();
    render(
      <Combobox
        searchPlacement="menu"
        ariaLabel="Target"
        value="model-a"
        options={OPTIONS}
        onChange={vi.fn()}
        menuHeader={<button onClick={create}>New session</button>}
      />,
    );
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "no-match" },
    });
    const action = screen.getByRole("button", { name: "New session" });
    expect(screen.getByRole("listbox")).not.toContainElement(action);
    fireEvent.click(action);
    expect(create).toHaveBeenCalledOnce();
  });
  it("renders the filter only in the popup and selects by keyboard", () => {
    const onChange = vi.fn();
    render(
      <Combobox
        searchPlacement="menu"
        ariaLabel="Model"
        value="model-a"
        options={OPTIONS}
        onChange={onChange}
      />,
    );
    const trigger = screen.getByRole("combobox", { name: "Model" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    fireEvent.click(trigger);
    const filter = screen.getByRole("textbox", { name: "Search Model" });
    expect(filter).toHaveFocus();
    expect(screen.getByText("Provider B")).toBeInTheDocument();
    fireEvent.change(filter, { target: { value: "model-b" } });
    expect(
      within(screen.getByRole("listbox", { name: "Model" })).getAllByRole(
        "option",
      ),
    ).toHaveLength(1);
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(filter, { key: "ArrowDown" });
    fireEvent.keyDown(filter, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("model-b");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it.each(["escape", "outside"])(
    "discards unselected text on %s",
    (dismiss) => {
      const onChange = vi.fn();
      render(
        <Combobox
          searchPlacement="menu"
          ariaLabel="Model"
          value="model-a"
          options={OPTIONS}
          onChange={onChange}
          onNew={(value) => ({ value, label: `Use custom: ${value}` })}
        />,
      );
      fireEvent.click(screen.getByRole("combobox"));
      const filter = screen.getByRole("textbox");
      fireEvent.change(filter, { target: { value: "custom-model" } });
      if (dismiss === "escape") fireEvent.keyDown(filter, { key: "Escape" });
      else fireEvent.mouseDown(document.body);
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      expect(screen.getByRole("combobox")).toHaveTextContent("First model");
    },
  );
});
