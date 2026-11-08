import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { CommentRail } from "./CommentRail";

afterEach(() => vi.restoreAllMocks());

function CollapsibleRail() {
  const [open, setOpen] = useState(false);
  return (
    <CommentRail
      open={open}
      onOpenChange={setOpen}
      launcherLabel="Open comments (4)"
    >
      <p>Existing feedback</p>
      <button onClick={() => setOpen(false)}>Minimize comments</button>
    </CommentRail>
  );
}

it("minimizes to a floating launcher and restores the right rail", () => {
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(1200);
  const { container } = render(<CollapsibleRail />);
  expect(screen.queryByText("Existing feedback")).toBeNull();
  expect(container.querySelector("[data-comment-rail]")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Open comments (4)" }));
  expect(screen.getByText("Existing feedback")).toBeVisible();
  expect(
    screen.getByRole("separator", { name: "Resize comment sidebar" }),
  ).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Minimize comments" }));
  expect(
    screen.getByRole("button", { name: "Open comments (4)" }),
  ).toBeVisible();
  expect(container.querySelector("[data-comment-rail]")).toBeNull();
});

it("opens narrow comments in a dialog instead of stacking them below the page", () => {
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(390);
  const { container } = render(<CollapsibleRail />);
  fireEvent.click(screen.getByRole("button", { name: "Open comments (4)" }));
  const dialog = screen.getByRole("dialog", { name: "Comments" });
  expect(within(dialog).getByText("Existing feedback")).toBeVisible();
  expect(container.querySelector("[data-comment-rail]")).toBeNull();
  expect(screen.queryByRole("separator")).toBeNull();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(
    screen.getByRole("button", { name: "Open comments (4)" }),
  ).toHaveFocus();
});

it("remembers preferred width across remounts and hides resizing when stacked", () => {
  localStorage.clear();
  const width = vi
    .spyOn(HTMLElement.prototype, "clientWidth", "get")
    .mockReturnValue(1200);
  const first = render(<CommentRail stacked={false}>Comments</CommentRail>);
  fireEvent.keyDown(screen.getByRole("separator"), { key: "ArrowLeft" });
  expect(localStorage.getItem("clicky.comment-sidebar.width")).toBe("336");
  first.unmount();
  width.mockReturnValue(0);
  const next = render(<CommentRail stacked={false}>Comments</CommentRail>);
  expect(screen.getByRole("separator")).toHaveAttribute("aria-valuenow", "280");
  // jsdom reports zero available width: the stored preference must survive that constraint.
  expect(localStorage.getItem("clicky.comment-sidebar.width")).toBe("336");
  next.rerender(<CommentRail stacked>Comments</CommentRail>);
  expect(screen.queryByRole("separator")).toBeNull();
});
