import { act, fireEvent, render, screen } from "@testing-library/react";
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
