import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { memo } from "react";
import { describe, expect, it, vi } from "vitest";
import { CommentProvider } from "./CommentProvider";
import {
  dottedAnchorResolver,
  exactAnchorResolver,
  strictAnchorResolver,
  useCommentAnchorActionsOptional,
  useCommentAnchorOptional,
  useCommentContext,
} from "./comment-context";
import { DOCUMENT_ANCHOR, type Comment } from "./comment-types";

const config = {
  statuses: [{ value: "open", label: "Open", unresolved: true }],
};

const comments: Comment[] = [
  {
    id: "a",
    body: "x",
    createdAt: "2026-01-01T00:00:00.000Z",
    anchor: "row.1",
    author: { name: "Ada" },
  },
  {
    id: "b",
    body: "y",
    createdAt: "2026-01-01T00:00:00.000Z",
    anchor: null,
    author: { name: "Bo" },
  },
];

function CountsProbe() {
  const ctx = useCommentContext();
  return (
    <span data-testid="counts">{`${ctx.commentCounts["row.1"]}/${ctx.commentCounts[DOCUMENT_ANCHOR]}`}</span>
  );
}

function ScrollProbe({ scrollTo }: { scrollTo: ReturnType<typeof vi.fn> }) {
  const ctx = useCommentContext();
  return (
    <div
      ref={(container) => {
        if (!container) return;
        Object.defineProperties(container, {
          clientHeight: { configurable: true, value: 400 },
          scrollTop: { configurable: true, value: 100, writable: true },
          scrollTo: { configurable: true, value: scrollTo },
        });
        container.getBoundingClientRect = () =>
          ({ top: 50, height: 400 }) as DOMRect;
        ctx.contentRef.current = container;
      }}
    >
      <div
        ref={(anchor) => {
          if (!anchor) return;
          anchor.getBoundingClientRect = () =>
            ({ top: 250, height: 40 }) as DOMRect;
          ctx.registerAnchor("row.1", anchor);
        }}
      />
      <button
        type="button"
        data-testid="scroll-anchor"
        onClick={() =>
          ctx.scrollToAnchor("row.1", {
            behavior: "smooth",
            block: "start",
            offset: 12,
          })
        }
      />
      <button
        type="button"
        data-testid="scroll-missing"
        data-result="unset"
        onClick={(event) => {
          event.currentTarget.dataset.result = String(
            ctx.scrollToAnchor("row.9"),
          );
        }}
      />
    </div>
  );
}

function RailProbe() {
  const ctx = useCommentContext();
  return (
    <>
      <button type="button" onClick={() => ctx.focusAnchor("row.1")}>
        Focus
      </button>
      <button type="button" onClick={ctx.openCommentList}>
        Open
      </button>
      <button type="button" onClick={ctx.closeRail}>
        Close
      </button>
    </>
  );
}

const AnchorProbe = memo(function AnchorProbe({
  anchor,
  onRender,
}: {
  anchor: string;
  onRender: () => void;
}) {
  const state = useCommentAnchorOptional(anchor);
  onRender();
  return (
    <span data-testid={`anchor-${anchor}`}>
      {`${state?.meta?.count ?? 0}/${state?.active ? "active" : "inactive"}`}
    </span>
  );
});

const AnchorActionsProbe = memo(function AnchorActionsProbe({
  onRender,
}: {
  onRender: (actions: unknown) => void;
}) {
  onRender(useCommentAnchorActionsOptional());
  return null;
});

describe("CommentProvider", () => {
  it("derives per-anchor counts from the comment list", () => {
    render(
      <CommentProvider comments={comments} config={config}>
        <CountsProbe />
      </CommentProvider>,
    );
    expect(screen.getByTestId("counts")).toHaveTextContent("1/1");
  });

  it("throws when the hook is used outside a provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<CountsProbe />)).toThrow(/within a CommentProvider/);
    spy.mockRestore();
  });

  it("scrolls its content container to an exact anchor and reports misses", () => {
    const scrollTo = vi.fn();
    render(
      <CommentProvider
        comments={comments}
        config={config}
        resolveAnchor={strictAnchorResolver}
      >
        <ScrollProbe scrollTo={scrollTo} />
      </CommentProvider>,
    );

    fireEvent.click(screen.getByTestId("scroll-anchor"));
    expect(scrollTo).toHaveBeenCalledWith({ top: 288, behavior: "smooth" });
    fireEvent.click(screen.getByTestId("scroll-missing"));
    expect(screen.getByTestId("scroll-missing")).toHaveAttribute(
      "data-result",
      "false",
    );
  });

  it("reports every rail action so a controlled host can reveal a hidden rail", () => {
    const onRailModeChange = vi.fn();
    render(
      <CommentProvider
        comments={comments}
        config={config}
        onRailModeChange={onRailModeChange}
      >
        <RailProbe />
      </CommentProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Focus" }));
    fireEvent.click(screen.getByRole("button", { name: "Focus" }));
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onRailModeChange.mock.calls).toEqual([
      ["focused"],
      ["focused"],
      ["all"],
      ["closed"],
    ]);
  });

  it("only re-renders the anchor whose comment metadata changed", async () => {
    const firstAnchorRender = vi.fn();
    const secondAnchorRender = vi.fn();
    const first = comments[0]!;
    const second: Comment = {
      id: "c",
      body: "z",
      createdAt: "2026-01-02T00:00:00.000Z",
      anchor: "row.2",
      author: { name: "Cy" },
    };
    const view = render(
      <CommentProvider comments={[first]} config={config}>
        <AnchorProbe anchor="row.1" onRender={firstAnchorRender} />
        <AnchorProbe anchor="row.2" onRender={secondAnchorRender} />
      </CommentProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("anchor-row.1")).toHaveTextContent("1/inactive");
    });
    firstAnchorRender.mockClear();
    secondAnchorRender.mockClear();

    view.rerender(
      <CommentProvider comments={[first, second]} config={config}>
        <AnchorProbe anchor="row.1" onRender={firstAnchorRender} />
        <AnchorProbe anchor="row.2" onRender={secondAnchorRender} />
      </CommentProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("anchor-row.2")).toHaveTextContent("1/inactive");
    });
    expect(firstAnchorRender).not.toHaveBeenCalled();
    expect(secondAnchorRender).toHaveBeenCalledTimes(1);
  });

  it("keeps anchor actions stable when the host callback changes", () => {
    const onRender = vi.fn();
    const view = render(
      <CommentProvider
        comments={comments}
        config={config}
        onRailModeChange={() => undefined}
        resolveAnchor={(anchor) => anchor}
      >
        <AnchorActionsProbe onRender={onRender} />
      </CommentProvider>,
    );
    onRender.mockClear();

    view.rerender(
      <CommentProvider
        comments={comments}
        config={config}
        onRailModeChange={() => undefined}
        resolveAnchor={(anchor) => anchor}
      >
        <AnchorActionsProbe onRender={onRender} />
      </CommentProvider>,
    );

    expect(onRender).not.toHaveBeenCalled();
  });
});

describe("anchor resolvers", () => {
  it("strict resolver never walks ancestors or falls back to the document", () => {
    expect(strictAnchorResolver("row.1", ["row.1", DOCUMENT_ANCHOR])).toBe(
      "row.1",
    );
    expect(strictAnchorResolver("row.9", [DOCUMENT_ANCHOR])).toBeNull();
  });

  it("exact resolver matches a key or falls back to the document anchor", () => {
    expect(exactAnchorResolver("row.1", ["row.1"])).toBe("row.1");
    expect(exactAnchorResolver("row.9", [DOCUMENT_ANCHOR])).toBe(
      DOCUMENT_ANCHOR,
    );
    expect(exactAnchorResolver("row.9", ["row.1"])).toBeNull();
  });

  it("dotted resolver walks up to the nearest registered ancestor", () => {
    expect(dottedAnchorResolver("a.b.c", ["a.b"])).toBe("a.b");
    expect(dottedAnchorResolver("a.b.c", ["a"])).toBe("a");
    expect(dottedAnchorResolver("a.b.c", [DOCUMENT_ANCHOR])).toBe(
      DOCUMENT_ANCHOR,
    );
  });
});
