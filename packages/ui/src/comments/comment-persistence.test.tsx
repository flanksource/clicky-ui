import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { setCommentDraft } from "../test/comment-editor";
import { CommentComposer } from "./CommentComposer";
import { DEFAULT_COMMENT_STATUSES } from "./comment-types";
import { CommentPersistenceBoundary } from "./CommentPersistenceBoundary";
import { createStore, useCommentState } from "./comment-persistence";

function Draft() {
  const [body, setBody] = useCommentState("draft:root", "");
  return (
    <input
      aria-label="Draft"
      value={body}
      onChange={(event) => setBody(event.target.value)}
    />
  );
}
beforeEach(() => sessionStorage.clear());
it("retains the draft in memory and reports failed storage writes", () => {
  const store = createStore("write-failure");
  const failure = vi
    .spyOn(Storage.prototype, "setItem")
    .mockImplementation(() => {
      throw new Error("Storage full");
    });
  store.write("draft:root:body", "Unsaved recovery text");
  expect(store.error).toContain("Storage full");
  expect(store.read("draft:root:body", "")).toEqual("Unsaved recovery text");
  failure.mockRestore();
  store.write("rail", "focused");
  expect(store.error).toBeNull();
  expect(createStore("write-failure").read("draft:root:body", "")).toEqual(
    "Unsaved recovery text",
  );
});
it("restores drafts after remount and isolates pages", () => {
  const view = render(
    <CommentPersistenceBoundary scope="page-a">
      <Draft />
    </CommentPersistenceBoundary>,
  );
  fireEvent.change(screen.getByLabelText("Draft"), {
    target: { value: "Keep this comment" },
  });
  view.unmount();
  const other = render(
    <CommentPersistenceBoundary scope="page-b">
      <Draft />
    </CommentPersistenceBoundary>,
  );
  expect(screen.getByLabelText("Draft")).toHaveValue("");
  other.unmount();
  render(
    <CommentPersistenceBoundary scope="page-a">
      <Draft />
    </CommentPersistenceBoundary>,
  );
  expect(screen.getByLabelText("Draft")).toHaveValue("Keep this comment");
});

it("restores a composer's body and rating and clears them only after successful submission", async () => {
  const onCreate = vi.fn();
  const composer = (
    <CommentPersistenceBoundary scope="composer">
      <CommentComposer
        anchor="summary"
        config={{ statuses: DEFAULT_COMMENT_STATUSES }}
        collapsible={false}
        onCreate={onCreate}
      />
    </CommentPersistenceBoundary>
  );
  const first = render(composer);
  setCommentDraft(
    screen.getByTestId("comment-compose-input"),
    "Keep my rating and text",
  );
  expect(screen.getByText("Saved drafts (1)")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Positive rating" }));
  first.unmount();
  const restored = render(composer);
  expect(screen.getByTestId("comment-compose-input")).toHaveTextContent(
    "Keep my rating and text",
  );
  fireEvent.click(screen.getByRole("button", { name: "Post comment" }));
  await screen.findByTestId("comment-compose-input");
  expect(onCreate).toHaveBeenCalledWith(
    expect.objectContaining({
      body: "Keep my rating and text",
      rating: "positive",
    }),
  );
  restored.unmount();
  render(composer);
  expect(screen.getByTestId("comment-compose-input")).not.toHaveTextContent(
    "Keep my rating and text",
  );
});
