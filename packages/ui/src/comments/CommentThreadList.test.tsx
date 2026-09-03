import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as clipboard from "../components/clipboard";
import { CommentThreadList } from "./CommentThreadList";
import {
  DEFAULT_COMMENT_STATUSES,
  type Comment,
  type CommentConfig,
} from "./comment-types";

const config: CommentConfig = { statuses: DEFAULT_COMMENT_STATUSES };

const comments: Comment[] = [
  {
    id: "r1",
    body: "root comment",
    createdAt: "2026-01-01T00:00:00.000Z",
    status: "open",
    author: { name: "Ada" },
  },
  {
    id: "c1",
    body: "a reply",
    parentId: "r1",
    createdAt: "2026-01-01T01:00:00.000Z",
    author: { name: "Bo" },
  },
];

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe("CommentThreadList", () => {
  it.each([
    ["root", 0],
    ["reply", 1],
  ])("maximizes the whole thread from the %s card", (_kind, index) => {
    render(<CommentThreadList comments={comments} config={config} />);

    fireEvent.click(
      screen.getAllByRole("button", { name: "Comment actions" })[index],
    );
    fireEvent.click(screen.getByText("Maximise"));

    const modal = screen.getByTestId("comment-thread-modal");
    expect(modal).toHaveTextContent("root comment");
    expect(modal).toHaveTextContent("a reply");
  });

  it("copies the whole thread through the supplied Markdown serializer", async () => {
    const copy = vi.spyOn(clipboard, "copyText").mockResolvedValue(undefined);
    const threadToMarkdown = vi.fn(() => "# Whole thread\n\nroot and reply");
    render(
      <CommentThreadList
        comments={comments}
        config={config}
        threadToMarkdown={threadToMarkdown}
      />,
    );

    fireEvent.click(
      screen.getAllByRole("button", { name: "Comment actions" })[1]!,
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Copy" }));

    await act(async () => undefined);
    expect(threadToMarkdown).toHaveBeenCalledWith(comments);
    expect(copy).toHaveBeenCalledWith("# Whole thread\n\nroot and reply");
  });

  it("previews the exact copied Markdown in a tab of the maximized thread", async () => {
    const markdown = "# Whole thread\n\nroot and reply";
    render(
      <CommentThreadList
        comments={comments}
        config={config}
        threadToMarkdown={() => markdown}
      />,
    );

    fireEvent.click(
      screen.getAllByRole("button", { name: "Comment actions" })[0]!,
    );
    fireEvent.click(screen.getByText("Maximise"));
    fireEvent.click(screen.getByRole("tab", { name: "Markdown" }));

    expect(await screen.findByText("Whole thread")).toBeInTheDocument();
    expect(screen.getByText("root and reply")).toBeInTheDocument();
  });

  it.each([
    ["root", 0, "root comment"],
    ["reply", 1, "a reply"],
  ])(
    "replies inline to the %s from the maximized thread",
    async (_kind, index, replyingToBody) => {
      const onReply = vi.fn().mockResolvedValue(undefined);
      render(
        <CommentThreadList
          comments={comments}
          config={config}
          onReply={onReply}
        />,
      );

      fireEvent.click(
        screen.getAllByRole("button", { name: "Comment actions" })[0],
      );
      fireEvent.click(screen.getByText("Maximise"));

      const modal = screen.getByTestId("comment-thread-modal");
      expect(modal).toHaveTextContent(replyingToBody);

      const replyButtons = screen.getAllByRole("button", { name: "Reply" });
      expect(replyButtons).toHaveLength(2);
      fireEvent.click(replyButtons[index]);

      const input = screen.getByPlaceholderText("Write a reply…");
      fireEvent.change(input, { target: { value: "answering inline" } });
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Send" }));
      });

      // The store nests messages under a comment, so every reply targets the root.
      expect(onReply).toHaveBeenCalledWith(comments[0], "answering inline");
    },
  );

  it("renders a card per root and reply", () => {
    render(<CommentThreadList comments={comments} config={config} />);
    const cards = screen.getAllByTestId("comment-card");
    expect(cards).toHaveLength(2);
    expect(
      cards.some((c) => c.getAttribute("data-comment-kind") === "reply"),
    ).toBe(true);
  });

  it("submits an inline reply through the reply affordance", async () => {
    const onReply = vi.fn();
    render(
      <CommentThreadList
        comments={comments}
        config={config}
        onReply={onReply}
      />,
    );

    // Expand the root, open its reply box, type, and submit with Enter.
    fireEvent.click(screen.getAllByTestId("comment-card")[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Reply" }));
    const input = screen.getByTestId("comment-reply-input");
    fireEvent.change(input, { target: { value: "thanks" } });
    await act(async () => {
      fireEvent.keyDown(input, { key: "Enter" });
    });

    expect(onReply).toHaveBeenCalledTimes(1);
    expect(onReply.mock.calls[0]?.[0]).toMatchObject({ id: "r1" });
    expect(onReply.mock.calls[0]?.[1]).toBe("thanks");
  });

  it("submits a reply only once while the request is pending", async () => {
    const request = deferred();
    const onReply = vi.fn(() => request.promise);
    render(
      <CommentThreadList
        comments={comments}
        config={config}
        onReply={onReply}
      />,
    );

    fireEvent.click(screen.getAllByTestId("comment-card")[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Reply" }));
    fireEvent.change(screen.getByTestId("comment-reply-input"), {
      target: { value: "Posted once" },
    });
    const send = screen.getByRole("button", { name: "Send" });
    fireEvent.click(send);
    fireEvent.click(send);

    expect(onReply).toHaveBeenCalledTimes(1);
    expect(send).toBeDisabled();

    await act(async () => request.resolve());
    expect(screen.queryByTestId("comment-reply-input")).not.toBeInTheDocument();
  });
});
