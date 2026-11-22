import { setCommentDraft } from "../test/comment-editor";
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

// MentionTextarea applies autoFocus on the next animation frame.
const nextFrame = () =>
  act(() => new Promise<void>((done) => requestAnimationFrame(() => done())));

describe("CommentComposer", () => {
  it("opens an always-open composer even when the previous persisted state was collapsed", () => {
    const config = { statuses: DEFAULT_COMMENT_STATUSES };
    const view = render(<CommentComposer config={config} />);
    expect(screen.queryByTestId("comment-compose-input")).toBeNull();
    view.rerender(<CommentComposer config={config} collapsible={false} />);
    expect(screen.getByTestId("comment-compose-input")).toBeVisible();
  });
  it("leaves focus alone when an always-open composer mounts", async () => {
    render(
      <CommentComposer
        config={{ statuses: DEFAULT_COMMENT_STATUSES }}
        collapsible={false}
      />,
    );
    await nextFrame();

    expect(screen.getByTestId("comment-compose-input")).not.toHaveFocus();
  });

  it("focuses the input when a collapsible composer is expanded", async () => {
    render(
      <CommentComposer
        config={{ statuses: DEFAULT_COMMENT_STATUSES }}
        placeholder="Comment on this account…"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Comment on this account…" }));
    await nextFrame();

    expect(screen.getByTestId("comment-compose-input")).toHaveFocus();
  });

  describe("comment target", () => {
    const targets = [
      { id: "session", name: "session", kind: "agent" as const },
      { id: "runtime:claude", name: "claude", kind: "agent" as const },
      { id: "runtime:codex", name: "codex", kind: "agent" as const },
    ];
    const config = { statuses: DEFAULT_COMMENT_STATUSES, targets };
    const renderComposer = (onCreate = vi.fn()) => {
      render(<CommentComposer config={config} collapsible={false} onCreate={onCreate} />);
      return onCreate;
    };

    it("offers no rating buttons", () => {
      renderComposer();
      expect([screen.queryByRole("button", { name: /rating/i })]).toEqual([null]);
    });

    it("posts the target chosen from the empty target picker", async () => {
      const onCreate = renderComposer();
      fireEvent.click(screen.getByRole("button", { name: "Send to…" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "@claude" }));
      setCommentDraft(screen.getByTestId("comment-compose-input"), "Tighten this layout");
      fireEvent.click(screen.getByRole("button", { name: "Post comment" }));

      expect(onCreate).toHaveBeenCalledWith({
        body: "Tighten this layout",
        anchor: null,
        target: { id: "runtime:claude", name: "claude", kind: "agent" },
      });
      await waitFor(() => expect(screen.getByRole("button", { name: "Send to…" })).toBeVisible());
    });

    it("sends an @-named agent typed into the comment as the plain body, with no client-side target", () => {
      const onCreate = renderComposer();
      setCommentDraft(screen.getByTestId("comment-compose-input"), "@codex fix the overflow");
      expect(screen.getByRole("button", { name: "Send to…" })).toBeVisible();
      fireEvent.click(screen.getByRole("button", { name: "Post comment" }));

      expect(onCreate).toHaveBeenCalledWith({ body: "@codex fix the overflow", anchor: null });
    });

    it("posts the target picked from the menu alongside an @-name in the text, and none once it is cleared", async () => {
      const onCreate = renderComposer();
      setCommentDraft(screen.getByTestId("comment-compose-input"), "ask @session about this");
      fireEvent.click(screen.getByRole("button", { name: "Send to…" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "@codex" }));
      expect(screen.getByRole("button", { name: "Send to @codex" })).toBeVisible();
      fireEvent.click(screen.getByRole("button", { name: "Post comment" }));
      expect(onCreate).toHaveBeenLastCalledWith({ body: "ask @session about this", anchor: null, target: { id: "runtime:codex", name: "codex", kind: "agent" } });
      await waitFor(() => expect(screen.getByRole("button", { name: "Send to…" })).toBeVisible());

      setCommentDraft(screen.getByTestId("comment-compose-input"), "no agent here");
      fireEvent.click(screen.getByRole("button", { name: "Send to…" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "@codex" }));
      fireEvent.click(screen.getByRole("button", { name: "Clear target" }));
      fireEvent.click(screen.getByRole("button", { name: "Post comment" }));

      expect(onCreate).toHaveBeenLastCalledWith({ body: "no agent here", anchor: null });
    });

    it("completes each @-name once when a target shares its name with a mentionable", async () => {
      render(
        <CommentComposer
          config={{ ...config, mentionables: [{ id: "agent-claude", name: "claude", kind: "agent" }] }}
          collapsible={false}
        />,
      );
      setCommentDraft(screen.getByTestId("comment-compose-input"), "@cla");

      await waitFor(() => expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["@claude"]));
    });

    it("previews the page's default delivery until a target replaces it", () => {
      const defaultDelivery = { label: "claude", description: "The project rule sends new threads here to claude" };
      render(<CommentComposer config={{ ...config, defaultDelivery }} collapsible={false} />);
      const chip = screen.getByRole("button", { name: "Send to… (default: claude)" });
      expect([chip.textContent, chip.title]).toEqual(["Auto: claude", defaultDelivery.description]);

      fireEvent.click(chip);
      fireEvent.click(screen.getByRole("menuitem", { name: "@codex" }));
      expect([
        screen.getByRole("button", { name: "Send to @codex" }).textContent,
        screen.queryByRole("button", { name: /default: claude/ }),
      ]).toEqual(["@codex", null]);
    });

    it.each([
      { name: "a host delivery preview", extra: { renderDeliveryPreview: () => <span data-testid="host-delivery">Send to…</span> }, testId: "host-delivery" },
      { name: "the default delivery line", extra: { defaultDelivery: { label: "claude-opus-5-5" } }, testId: "default-delivery" },
    ])("puts $name on the send button's row, before the button", ({ extra, testId }) => {
      render(<CommentComposer config={{ statuses: DEFAULT_COMMENT_STATUSES, ...extra }} collapsible={false} />);
      const row = screen.getByRole("button", { name: "Post comment" }).closest("[data-comment-actions]");
      const delivery = screen.getByTestId(testId);
      expect({
        sameRow: row?.contains(delivery) ?? false,
        before: Boolean(delivery.compareDocumentPosition(screen.getByRole("button", { name: "Post comment" })) & Node.DOCUMENT_POSITION_FOLLOWING),
      }).toEqual({ sameRow: true, before: true });
    });

    it("states the default delivery and the layer its rule came from under the input, even with no target menu", () => {
      render(
        <CommentComposer
          config={{ statuses: DEFAULT_COMMENT_STATUSES, defaultDelivery: { label: "claude-opus-5-5", layer: "project" } }}
          collapsible={false}
        />,
      );
      expect(screen.getByTestId("default-delivery").textContent).toBe("Comments without an @target go to claude-opus-5-5 (rule from project)");
    });

    it.each([
      { name: "a null default (no rule enabled)", defaultDelivery: null },
      { name: "an unknown default", defaultDelivery: undefined },
    ])("shows no default-delivery line for $name", ({ defaultDelivery }) => {
      render(
        <CommentComposer
          config={{ statuses: DEFAULT_COMMENT_STATUSES, ...(defaultDelivery === undefined ? {} : { defaultDelivery }) }}
          collapsible={false}
        />,
      );
      expect(screen.queryByTestId("default-delivery")).toBeNull();
    });

    it("offers @agent, runtime families and session slugs from config.mentionables and sends the body untouched", async () => {
      const mentionables = [
        { id: "agent", name: "agent", kind: "agent" as const },
        { id: "runtime:claude", name: "claude", kind: "agent" as const },
        { id: "session:review-7", name: "review-7", kind: "agent" as const },
      ];
      const onCreate = vi.fn();
      render(<CommentComposer config={{ statuses: DEFAULT_COMMENT_STATUSES, mentionables }} collapsible={false} onCreate={onCreate} />);
      setCommentDraft(screen.getByTestId("comment-compose-input"), "@");
      await waitFor(() => expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["@agent", "@claude", "@review-7"]));

      setCommentDraft(screen.getByTestId("comment-compose-input"), "@claude tighten this");
      fireEvent.click(screen.getByRole("button", { name: "Post comment" }));
      expect(onCreate).toHaveBeenCalledWith({ body: "@claude tighten this", anchor: null });
    });

    it("says a comment is not delivered when the page has no default delivery", () => {
      render(<CommentComposer config={{ ...config, defaultDelivery: null }} collapsible={false} />);
      const chip = screen.getByRole("button", { name: "Send to… (not delivered by default)" });
      expect(chip.textContent).toBe("Not delivered");
    });

    it("sends text containing an @ inside a longer word unchanged, with no target", () => {
      const onCreate = renderComposer();
      setCommentDraft(screen.getByTestId("comment-compose-input"), "mail me@codexample.com");
      fireEvent.click(screen.getByRole("button", { name: "Post comment" }));

      expect(onCreate).toHaveBeenCalledWith({ body: "mail me@codexample.com", anchor: null });
    });
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

    setCommentDraft(screen.getByTestId("comment-compose-input"), "Review this balance");
    const send = screen.getByRole("button", { name: "Post comment" });
    fireEvent.click(send);
    fireEvent.click(send);

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(send).toBeDisabled();
    expect(send).toHaveAttribute("aria-busy", "true");

    await act(async () => request.resolve());
    expect(send).not.toHaveAttribute("aria-busy");
    expect(screen.getByTestId("comment-compose-input")).toHaveTextContent(/^$/);
  });

  it("offers two submit actions for one draft and keeps the selected action while posting", async () => {
    const request = deferred();
    const onCreate = vi.fn(() => request.promise);
    render(
      <CommentComposer
        config={{ statuses: DEFAULT_COMMENT_STATUSES }}
        collapsible={false}
        createActions={[
          { id: "plain", label: "Post comment" },
          { id: "screenshot", label: "Post with screenshot" },
        ]}
        onCreate={onCreate}
      />,
    );

    setCommentDraft(screen.getByTestId("comment-compose-input"), "Review this balance");
    fireEvent.click(screen.getByRole("button", { name: "Send options" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Post with screenshot" }));
    fireEvent.click(screen.getByRole("button", { name: "Post comment" }));

    expect(onCreate).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ body: "Review this balance" }),
      "screenshot",
    );
    await vi.waitFor(() => expect(screen.getByTestId("comment-compose-input")).toHaveTextContent(/^$/));
    expect(screen.getByRole("button", { name: "Post comment" })).toBeDisabled();
    await act(async () => request.resolve());
    expect(screen.getByTestId("comment-compose-input")).toHaveTextContent(/^$/);
  });
});
