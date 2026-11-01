/** @vitest-environment jsdom */

import { StrictMode } from "react";
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as ClickyUI from "@flanksource/clicky-ui";
import { CommentsDemo } from "./CommentsDemo";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("CommentsDemo", () => {
  it("initializes filters only on mount", () => {
    const initialize = vi.spyOn(ClickyUI, "emptyCommentFilters");
    const { rerender } = render(<CommentsDemo />);
    const callsOnMount = initialize.mock.calls.length;
    rerender(<CommentsDemo />);
    expect(callsOnMount).toBeGreaterThan(0);
    expect(initialize).toHaveBeenCalledTimes(callsOnMount);
  });

  it("keeps sequential ids for submitted comments under StrictMode", async () => {
    const { container } = render(
      <StrictMode>
        <CommentsDemo />
      </StrictMode>,
    );
    const thread = container.querySelector<HTMLElement>("#comments-thread")!;
    const ui = within(thread);

    for (const body of ["First review note", "Second review note"]) {
      fireEvent.click(ui.getByRole("button", { name: "Add a comment…" }));
      fireEvent.change(ui.getByTestId("comment-compose-input"), {
        target: { value: body },
      });
      fireEvent.click(ui.getByRole("button", { name: "Post comment" }));
      await waitFor(() =>
        expect(ui.queryByTestId("comment-compose-input")).toBeNull(),
      );
    }

    expect(
      [
        ...thread.querySelectorAll(
          '[data-testid="comment-thread-block"][data-comment-id^="gen-"]',
        ),
      ].map((item) => item.getAttribute("data-comment-id")),
    ).toEqual(["gen-1", "gen-2"]);
  });
});
