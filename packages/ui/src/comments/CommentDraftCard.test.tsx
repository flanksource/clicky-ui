import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeAll, afterAll, expect, it, vi } from "vitest";
import { setCommentDraft } from "../test/comment-editor";
import { CommentDraftCard } from "./CommentDraftCard";
import { CommentDraftPopover } from "./CommentDraftPopover";
import { CommentProvider } from "./CommentProvider";
import { CommentSidePanel } from "./CommentSidePanel";
import { useCommentContext } from "./comment-context";
import { useEffect } from "react";
import { DEFAULT_COMMENT_STATUSES } from "./comment-types";

const config = { statuses: DEFAULT_COMMENT_STATUSES };
beforeAll(() =>
  Object.defineProperty(Range.prototype, "getBoundingClientRect", {
    configurable: true,
    value: () => new DOMRect(),
  }),
);
afterAll(() =>
  Reflect.deleteProperty(Range.prototype, "getBoundingClientRect"),
);
it("portals an autofocused editor outside the artifact without a duplicate rail composer", async () => {
  function Rail() {
    const { focusAnchor } = useCommentContext();
    useEffect(() => focusAnchor("target"), [focusAnchor]);
    return <CommentSidePanel hideComposer />;
  }
  const target = document.createElement("button");
  document.body.append(target);
  const onDiscard = vi.fn();
  const view = render(
    <CommentProvider
      config={config}
      comments={[]}
      initialRailMode="all"
      onCreate={vi.fn()}
    >
      <CommentDraftPopover
        config={config}
        anchor="target"
        label="Target"
        reference={target}
        onDiscard={onDiscard}
        onCreate={vi.fn()}
      />
      <Rail />
    </CommentProvider>,
  );
  const dialog = screen.getByRole("dialog", { name: "New comment on Target" });
  expect(view.container.contains(dialog)).toBe(false);
  expect(screen.getAllByTestId("comment-compose-input")).toHaveLength(1);
  expect(screen.getByTestId("comment-focused-rail")).toBeVisible();
  await waitFor(() =>
    expect(screen.getByTestId("comment-compose-input")).toHaveFocus(),
  );
  fireEvent.mouseLeave(dialog);
  expect(onDiscard).not.toHaveBeenCalled();
  fireEvent.keyDown(screen.getByTestId("comment-compose-input"), {
    key: "Escape",
  });
  expect(onDiscard).toHaveBeenCalledOnce();
  target.remove();
});
it("retains the draft and displays a failed create request for retry", async () => {
  render(
    <CommentDraftCard
      config={config}
      anchor="target"
      label="Target"
      onDiscard={vi.fn()}
      onCreate={async () => {
        throw new Error("Server unavailable");
      }}
    />,
  );
  setCommentDraft(
    screen.getByTestId("comment-compose-input"),
    "Keep this draft",
  );
  fireEvent.click(screen.getByRole("button", { name: "Post comment" }));
  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent("Server unavailable"),
  );
  expect(screen.getByTestId("comment-compose-input")).toHaveTextContent(
    "Keep this draft",
  );
});
it("forwards screenshot actions and prevents discarding an in-flight submission", async () => {
  let finish!: () => void;
  const onCreate = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const onDiscard = vi.fn();
  render(
    <CommentDraftCard
      config={config}
      anchor="target"
      label="Target"
      onDiscard={onDiscard}
      onCreate={onCreate}
      createActions={[{ id: "screenshot", label: "Post with screenshot" }]}
    />,
  );
  setCommentDraft(screen.getByTestId("comment-compose-input"), "Capture this");
  fireEvent.click(screen.getByRole("button", { name: "Post with screenshot" }));
  expect(onCreate).toHaveBeenCalledWith(
    expect.objectContaining({ anchor: "target", body: "Capture this" }),
    "screenshot",
  );
  expect(
    screen.getByRole("button", { name: "Discard comment" }),
  ).toBeDisabled();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(onDiscard).not.toHaveBeenCalled();
  await act(async () => finish());
});
