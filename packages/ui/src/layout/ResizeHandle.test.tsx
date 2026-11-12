import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { ResizeHandle } from "./ResizeHandle";

it("resizes a right rail with keyboard steps, shift acceleration and limits", () => {
  const onChange = vi.fn();
  render(<ResizeHandle orientation="vertical" value={320} min={280} max={640} pointerFactor={-1} label="Resize rail" onChange={onChange} />);
  const handle = screen.getByRole("separator", { name: "Resize rail" });
  fireEvent.keyDown(handle, { key: "ArrowLeft" });
  fireEvent.keyDown(handle, { key: "ArrowRight", shiftKey: true });
  fireEvent.keyDown(handle, { key: "Home" });
  fireEvent.keyDown(handle, { key: "End" });
  expect(onChange.mock.calls).toEqual([[336], [280], [280], [640]]);
  expect(handle).toHaveAttribute("aria-valuenow", "320");
});
