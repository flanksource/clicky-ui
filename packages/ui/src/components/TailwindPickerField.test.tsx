import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { expect, it, vi } from "vitest";
import { TailwindColorPickerField } from "./TailwindColorPickerField";
import { TailwindNumberPickerField } from "./TailwindNumberPickerField";
import type { TailwindPickerValue } from "./tailwind-picker-types";

it("uses one color input for raw values and searchable Tailwind classes", () => {
  const onChange = vi.fn();
  render(<TailwindColorPickerField ariaLabel="Fill" utility="fill" value={{ kind: "literal", value: "#123456" }} onChange={onChange} />);
  const input = screen.getByRole("combobox", { name: "Fill" });
  expect(input).toHaveValue("#123456");
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: "fill-red-500" } });
  fireEvent.mouseDown(screen.getByRole("option", { name: "fill-red-500" }));
  expect(onChange).toHaveBeenLastCalledWith({ kind: "utility", value: "fill-red-500" });
  expect(screen.getAllByRole("combobox")).toHaveLength(1);
});

it("previews raw color typing and native color selection through the same field", () => {
  const onChange = vi.fn();
  render(<TailwindColorPickerField ariaLabel="Fill" value={{ kind: "utility", value: "bg-primary" }} onChange={onChange} />);
  fireEvent.change(screen.getByRole("combobox", { name: "Fill" }), { target: { value: "#aabbcc" } });
  expect(onChange).toHaveBeenLastCalledWith({ kind: "literal", value: "#aabbcc" });
  fireEvent.change(screen.getByLabelText("Fill color picker"), { target: { value: "#ccbb00" } });
  expect(onChange).toHaveBeenLastCalledWith({ kind: "literal", value: "#ccbb00" });
});

it.each([
  ["fontSize", "text-2xl", "24", 24],
  ["strokeWidth", "stroke-2", "3.5", 3.5],
  ["strokeWidth", "stroke-4", "4", 4],
  ["opacity", "opacity-50", "0.75", 0.75],
] as const)("offers Tailwind utilities and raw numbers for %s", (property, utility, raw, number) => {
  const onChange = vi.fn();
  render(<TailwindNumberPickerField ariaLabel="Size" property={property} value={{ kind: "literal", value: 13 }} onChange={onChange} />);
  const input = screen.getByRole("combobox", { name: "Size" });
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: utility } });
  fireEvent.mouseDown(screen.getByRole("option", { name: new RegExp(`^${utility}( |$)`) }));
  expect(onChange).toHaveBeenLastCalledWith({ kind: "utility", value: utility });
  fireEvent.change(input, { target: { value: raw } });
  expect(onChange).toHaveBeenLastCalledWith({ kind: "literal", value: number });
});

it("preserves an unfinished number and offers an explicit reset", () => {
  const onChange = vi.fn();
  const onReset = vi.fn();
  render(<TailwindNumberPickerField ariaLabel="Size" property="fontSize" value={{ kind: "literal", value: 13 }} onChange={onChange} onReset={onReset} />);
  fireEvent.change(screen.getByRole("combobox", { name: "Size" }), { target: { value: "33." } });
  expect(onChange).toHaveBeenLastCalledWith({ kind: "literal", value: "33." });
  fireEvent.click(screen.getByRole("button", { name: "Reset Size" }));
  expect(onReset).toHaveBeenCalledTimes(1);
});

it("shows a native color selection even when the typeahead is open", () => {
  function ControlledColor() {
    const [value, setValue] = useState<TailwindPickerValue>({ kind: "literal", value: "#112233" });
    return <TailwindColorPickerField ariaLabel="Fill" value={value} onChange={setValue} />;
  }
  render(<ControlledColor />);
  const input = screen.getByRole("combobox", { name: "Fill" });
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: "#334455" } });
  fireEvent.change(screen.getByLabelText("Fill color picker"), { target: { value: "#aabbcc" } });
  expect(input).toHaveValue("#aabbcc");
});

it("closes an open lookup on Escape before passing Escape to its dialog", () => {
  const onKeyDown = vi.fn();
  render(<div onKeyDown={onKeyDown}><TailwindNumberPickerField ariaLabel="Size" property="fontSize" value={{ kind: "literal", value: 13 }} onChange={vi.fn()} /></div>);
  const input = screen.getByRole("combobox", { name: "Size" });
  fireEvent.focus(input);
  fireEvent.keyDown(input, { key: "Escape" });
  expect(screen.queryByRole("listbox")).toBeNull();
  expect(onKeyDown).not.toHaveBeenCalled();
  fireEvent.keyDown(input, { key: "Escape" });
  expect(onKeyDown).toHaveBeenCalledTimes(1);
});
