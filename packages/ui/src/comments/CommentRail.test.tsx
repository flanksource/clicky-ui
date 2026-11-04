import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { CommentRail } from "./CommentRail";

it("remembers preferred width across remounts and hides resizing when stacked", () => {
  localStorage.clear();
  const width = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(1200);
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
