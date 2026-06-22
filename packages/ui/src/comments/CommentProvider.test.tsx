import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommentProvider } from "./CommentProvider";
import {
  dottedAnchorResolver,
  exactAnchorResolver,
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
});

describe("anchor resolvers", () => {
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
