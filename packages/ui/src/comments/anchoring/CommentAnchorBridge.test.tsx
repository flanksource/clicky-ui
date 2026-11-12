import { useLayoutEffect } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommentProvider } from "../CommentProvider";
import { useCommentAnchorActionsOptional, useCommentContext } from "../comment-context";
import { CommentAnchorBridge } from "./CommentAnchorBridge";

function Annotated() {
  const actions = useCommentAnchorActionsOptional()!;
  const context = useCommentContext();
  useLayoutEffect(() => {
    actions.registerAnchor("total", document.querySelector("article"));
    return () => actions.registerAnchor("total", null);
  }, [actions]);
  return <article><button onClick={() => actions.focusAnchor("total")}>Focus actions</button><button onClick={() => context.focusAnchor("total")}>Focus context</button></article>;
}

describe("CommentAnchorBridge", () => {
  it("forwards registration, unregistration and focus through both comment hooks", () => {
    const registerAnchor = vi.fn();
    const focusAnchor = vi.fn();
    const view = render(<CommentProvider comments={[]} config={{ statuses: [] }}>
      <CommentAnchorBridge registerAnchor={registerAnchor} focusAnchor={focusAnchor}><Annotated /></CommentAnchorBridge>
    </CommentProvider>);
    const article = document.querySelector("article");
    fireEvent.click(screen.getByText("Focus actions"));
    fireEvent.click(screen.getByText("Focus context"));
    view.unmount();
    expect({ registrations: registerAnchor.mock.calls, focuses: focusAnchor.mock.calls }).toEqual({
      registrations: [["total", article], ["total", null]], focuses: [["total"], ["total"]],
    });
  });
});
