import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { CommentPreview } from "./CommentPreview";

it("offers expansion only for overflowing content and preserves links", () => {
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(100);
  const navigate = vi.fn();
  const originalStyle = window.getComputedStyle;
  vi.spyOn(window, "getComputedStyle").mockImplementation(element => {
    const result = originalStyle(element);
    Object.defineProperty(result, "lineHeight", { value: "20px" });
    return result;
  });
  render(<div onClick={navigate}><CommentPreview id="preview" lines={3}><a href="#reference">Reference</a><p>Long text</p></CommentPreview></div>);
  const control = screen.getByRole("button", { name: "Show more" });
  expect(screen.getByRole("link", { name: "Reference" })).toHaveAttribute("href", "#reference");
  fireEvent.click(control);
  expect(navigate).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Show less" })).toHaveAttribute("aria-expanded", "true");
  fireEvent.click(screen.getByText("Show less"));
  expect(control).toHaveAttribute("aria-expanded", "false");
});

it("does not offer expansion for short bodies", () => {
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(20);
  render(<div style={{ lineHeight: "20px" }}><CommentPreview id="short" lines={3}>Short</CommentPreview></div>);
  expect(screen.queryByRole("button")).toBeNull();
});
