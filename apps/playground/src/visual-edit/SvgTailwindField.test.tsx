import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { SvgTailwindField } from "./SvgTailwindField";
import { SvgDeleteButton } from "./SvgDeleteButton";

beforeEach(() => vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("searches color classes and preserves unrelated utilities when one is selected", () => {
  const onChange = vi.fn();
  render(<SvgTailwindField element={document.createElementNS("http://www.w3.org/2000/svg", "rect")} property="fill" baseline={{ fill: "#123456" }} values={{ fill: "#123456", className: "fill-primary stroke-2" }} onChange={onChange} />);
  fireEvent.focus(screen.getByRole("combobox", { name: "fill" }));
  fireEvent.change(screen.getByRole("combobox", { name: "fill" }), { target: { value: "fill-red-500" } });
  fireEvent.mouseDown(screen.getByRole("option", { name: /fill-red-500/ }));
  expect(onChange).toHaveBeenCalledWith({ fill: "#123456", className: "stroke-2 fill-red-500" });
});

it("offers font sizes as Tailwind classes without replacing the text color", () => {
  const onChange = vi.fn();
  render(<SvgTailwindField element={document.createElementNS("http://www.w3.org/2000/svg", "text")} property="fontSize" baseline={{ fontSize: 13 }} values={{ className: "text-primary text-xs" }} onChange={onChange} />);
  fireEvent.focus(screen.getByRole("combobox", { name: "fontSize" }));
  fireEvent.mouseDown(screen.getByRole("option", { name: /text-9xl/ }));
  expect(onChange).toHaveBeenCalledWith({ fontSize: 13, className: "text-primary text-9xl" });
});

it("switches from a font class to a raw number while preserving color and responsive classes", () => {
  const onChange = vi.fn();
  render(<SvgTailwindField element={document.createElementNS("http://www.w3.org/2000/svg", "text")} property="fontSize" baseline={{ fontSize: 13 }} values={{ fontSize: 13, className: "text-primary text-xs md:text-lg" }} onChange={onChange} />);
  fireEvent.change(screen.getByRole("combobox", { name: "fontSize" }), { target: { value: "24" } });
  expect(onChange).toHaveBeenLastCalledWith({ fontSize: 24, className: "text-primary md:text-lg" });
  fireEvent.click(screen.getByRole("button", { name: "Remove fontSize attribute" }));
  expect(onChange).toHaveBeenLastCalledWith({ fontSize: null, className: "text-primary md:text-lg" });
});

it("reports inline styles that prevent a chosen class from taking effect", () => {
  const element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  element.style.fill = "red";
  const onChange = vi.fn();
  render(<SvgTailwindField element={element} property="fill" baseline={{}} values={{}} onChange={onChange} />);
  fireEvent.focus(screen.getByRole("combobox", { name: "fill" }));
  fireEvent.mouseDown(screen.getByRole("option", { name: /fill-primary$/ }));
  expect(screen.getByText("fill is controlled by an inline style; open source to edit it")).toBeTruthy();
  expect(onChange).not.toHaveBeenCalled();
});

it("requires confirmation to delete and explains repeated call sites", () => {
  const onDelete = vi.fn(async () => {});
  render(<SvgDeleteButton disabled={false} saving={false} instances={2} onDelete={onDelete} />);
  fireEvent.click(screen.getByRole("button", { name: "Delete SVG element" }));
  expect(onDelete).not.toHaveBeenCalled();
  expect(screen.getByText(/2 instances/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Cancel deletion" }));
  expect(screen.queryByRole("button", { name: "Confirm delete" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Delete SVG element" }));
  fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }));
  expect(onDelete).toHaveBeenCalledTimes(1);
});
