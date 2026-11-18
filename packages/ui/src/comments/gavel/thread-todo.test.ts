import { describe, expect, it } from "vitest";
import { buildThreadTodo, type TodoThreadComment } from "./thread-todo";

const pageUrl = "https://app.example/dashboard?tab=1";

const root: TodoThreadComment = {
  id: "t1",
  body: "The total ignores the discount\nIt shows 120 but should be 100.",
  createdAt: "2026-01-01T00:00:00.000Z",
  status: "open",
  author: { name: "Ada" },
  anchor: "e:main > section:nth-child(2)",
  element: {
    pageUrl: "https://app.example/orders",
    componentName: "OrderTotal",
    source: "src/OrderTotal.tsx:14",
    html: "<div class=\"total\">120</div>",
    screenshot: { status: "captured", filename: "screenshot.png", url: "/api/v1/comments/t1/attachments/a1" },
  },
};
const reply: TodoThreadComment = { id: "m1", parentId: "t1", body: "Reproduced.\nSecond line.", createdAt: "2026-01-01T00:05:00.000Z", author: { name: "claude", kind: "agent" } };

describe("buildThreadTodo", () => {
  it("titles the todo with the root's first line", () => {
    expect(buildThreadTodo({ thread: [root, reply], pageUrl }).title).toBe("The total ignores the discount");
  });

  it("carries the anchor, element context, screenshot reference and replies in the body", () => {
    const { body } = buildThreadTodo({ thread: [root, reply], pageUrl });
    expect(body).toBe(
      [
        "The total ignores the discount",
        "It shows 120 but should be 100.",
        "",
        "**Anchor:** `e:main > section:nth-child(2)`",
        "**Component:** `<OrderTotal>`",
        "**Page:** https://app.example/orders",
        "",
        "```",
        "src/OrderTotal.tsx:14",
        "```",
        "",
        "**HTML:**",
        "```html",
        "<div class=\"total\">120</div>",
        "```",
        "",
        "## Replies",
        "",
        "**claude** · 2026-01-01T00:05:00.000Z",
        "> Reproduced.",
        "> Second line.",
        "",
        "## Attachments",
        "",
        "![screenshot.png](/api/v1/comments/t1/attachments/a1)",
      ].join("\n"),
    );
  });

  it("returns the page the thread was left on as the todo's source URL", () => {
    expect(buildThreadTodo({ thread: [root], pageUrl }).sourceUrl).toBe("https://app.example/orders");
    expect(buildThreadTodo({ thread: [{ ...root, element: undefined }], pageUrl }).sourceUrl).toBe(pageUrl);
  });

  it("omits the anchor line for a document-level thread and the replies section when nobody replied", () => {
    const { body } = buildThreadTodo({ thread: [{ id: "d1", body: "Needs an owner", createdAt: root.createdAt, author: null, anchor: "__document__" }], pageUrl });
    expect(body).toBe("Needs an owner");
  });

  it("notes an unavailable screenshot instead of linking one", () => {
    const { body } = buildThreadTodo({ thread: [{ ...root, element: { ...root.element!, screenshot: { status: "unavailable", reason: "failed" } } }], pageUrl });
    expect([body.includes("![screenshot.png]"), body.includes("Screenshot unavailable (failed)")]).toEqual([false, true]);
  });

  it("titles a bodyless thread by its component, then its anchor", () => {
    expect(buildThreadTodo({ thread: [{ ...root, body: "" }], pageUrl }).title).toBe("OrderTotal");
    expect(buildThreadTodo({ thread: [{ id: "x", body: " ", createdAt: root.createdAt, author: null, anchor: "r:src/a.ts:3" }], pageUrl }).title).toBe("Comment on r:src/a.ts:3");
  });

  it("clips a long first line to a title", () => {
    const title = buildThreadTodo({ thread: [{ ...root, body: "x".repeat(200) }], pageUrl }).title;
    expect([title.length, title.endsWith("…")]).toEqual([100, true]);
  });

  it("throws for an empty thread or a first message that is a reply", () => {
    expect(() => buildThreadTodo({ thread: [], pageUrl })).toThrow("thread has no root comment");
    expect(() => buildThreadTodo({ thread: [reply], pageUrl })).toThrow("first comment of a thread must be its root");
  });
});
