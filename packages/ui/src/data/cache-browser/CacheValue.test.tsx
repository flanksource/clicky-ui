import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CacheValue } from "./CacheValue";
import type { CacheKeyDetail } from "./types";

const detail = (overrides: Partial<CacheKeyDetail>): CacheKeyDetail => ({
  key: "k",
  type: "string",
  ttlSeconds: -1,
  length: 0,
  ...overrides,
});

describe("CacheValue", () => {
  it("renders hash fields as a key/value list", () => {
    const { container } = render(
      <CacheValue
        detail={detail({ type: "hash", length: 2, fields: { name: "Plan One", tier: "gold" } })}
      />,
    );
    expect(container.textContent).toContain("name");
    expect(container.textContent).toContain("Plan One");
    expect(container.textContent).toContain("tier");
    expect(container.textContent).toContain("gold");
  });

  it("renders zset members with scores in rank order", () => {
    const { container } = render(
      <CacheValue
        detail={detail({
          type: "zset",
          length: 2,
          members: [
            { member: "alice", score: 1.5 },
            { member: "bob", score: 2.5 },
          ],
        })}
      />,
    );
    const text = container.textContent ?? "";
    expect(text.indexOf("alice")).toBeGreaterThan(-1);
    expect(text.indexOf("alice")).toBeLessThan(text.indexOf("bob"));
    expect(text).toContain("1.5");
  });

  it("renders list items with their index", () => {
    const { container } = render(
      <CacheValue detail={detail({ type: "list", length: 2, items: ["first", "second"] })} />,
    );
    expect(container.textContent).toContain("#0");
    expect(container.textContent).toContain("first");
    expect(container.textContent).toContain("#1");
    expect(container.textContent).toContain("second");
  });

  it("shows a truncation banner with the full length", () => {
    const { container } = render(
      <CacheValue
        detail={detail({ type: "string", length: 5000, value: "abc", truncated: true })}
      />,
    );
    expect(container.textContent).toContain("truncated");
    expect(container.textContent).toContain("5000");
  });

  it("explains unrendered value types instead of showing nothing", () => {
    const { container } = render(<CacheValue detail={detail({ type: "stream", length: 42 })} />);
    expect(container.textContent).toContain("stream");
    expect(container.textContent).toContain("42");
  });
});
