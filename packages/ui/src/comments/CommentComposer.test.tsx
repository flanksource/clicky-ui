import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommentComposer } from "./CommentComposer";
import { DEFAULT_COMMENT_STATUSES } from "./comment-types";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe("CommentComposer", () => {
  it.each([
    ["Positive", "positive"],
    ["Negative", "negative"],
  ] as const)("submits a %s rating with the comment", async (label, rating) => {
    const onCreate = vi.fn();
    render(
      <CommentComposer
        config={{ statuses: DEFAULT_COMMENT_STATUSES }}
        collapsible={false}
        onCreate={onCreate}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: `${label} rating` }));
    fireEvent.change(screen.getByTestId("comment-compose-input"), {
      target: { value: "This comparison is clear" },
    });
    fireEvent.click(screen.getByTestId("comment-compose-send"));

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ body: "This comparison is clear", rating }),
    );
    await waitFor(() =>
      expect(screen.getByTestId("comment-compose-input")).toHaveValue(""),
    );
  });

  it("allows a rating without forcing placeholder comment text", async () => {
    const onCreate = vi.fn();
    render(
      <CommentComposer
        config={{ statuses: DEFAULT_COMMENT_STATUSES }}
        collapsible={false}
        onCreate={onCreate}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Positive rating" }));
    fireEvent.click(screen.getByTestId("comment-compose-send"));

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ body: "", rating: "positive" }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Positive rating" }),
      ).toHaveAttribute("aria-pressed", "false"),
    );
  });

  it("submits a comment only once while the create request is pending", async () => {
    const request = deferred();
    const onCreate = vi.fn(() => request.promise);
    render(
      <CommentComposer
        config={{ statuses: DEFAULT_COMMENT_STATUSES }}
        collapsible={false}
        onCreate={onCreate}
      />,
    );

    fireEvent.change(screen.getByTestId("comment-compose-input"), {
      target: { value: "Review this balance" },
    });
    const send = screen.getByTestId("comment-compose-send");
    fireEvent.click(send);
    fireEvent.click(send);

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(send).toBeDisabled();

    await act(async () => request.resolve());
    expect(screen.getByTestId("comment-compose-input")).toHaveValue("");
  });
});
