import { afterEach, describe, expect, it, vi } from "vitest";

// The Shiki core is replaced by a counting fake: these tests are about how
// often and when highlightCode reaches the highlighter, not about its output.
const { codeToHtml } = vi.hoisted(() => ({
  codeToHtml: vi.fn((source: string) => `<pre>${source}</pre>`),
}));
vi.mock("shiki/core", () => ({
  createHighlighterCore: vi.fn(async () => ({ codeToHtml, codeToTokens: vi.fn() })),
}));
vi.mock("shiki/engine/oniguruma", () => ({ createOnigurumaEngine: vi.fn(() => ({})) }));
vi.mock("shiki/wasm", () => ({ default: {} }));

import { highlightCode } from "./code-highlight";

const nextTask = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("highlightCode", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    codeToHtml.mockImplementation((source: string) => `<pre>${source}</pre>`);
    codeToHtml.mockClear();
  });

  it("serves a repeated source, language and theme from cache", async () => {
    const opts = { lang: "sql", theme: "github-light" };

    const first = await highlightCode("SELECT 1 FROM cached", opts);
    const second = await highlightCode("SELECT 1 FROM cached", opts);

    expect({ first, second, calls: codeToHtml.mock.calls.length }).toEqual({
      first: "<pre>SELECT 1 FROM cached</pre>",
      second: "<pre>SELECT 1 FROM cached</pre>",
      calls: 1,
    });
  });

  it("highlights the same source again for a different theme", async () => {
    await highlightCode("SELECT 1 FROM themed", { lang: "sql", theme: "github-light" });
    await highlightCode("SELECT 1 FROM themed", { lang: "sql", theme: "github-dark" });

    expect(codeToHtml).toHaveBeenCalledTimes(2);
  });

  it("yields between highlights once one overruns its time slice", async () => {
    await highlightCode("SELECT 1 FROM warmup", { lang: "sql" });
    codeToHtml.mockClear();
    // Each highlight takes longer than a slice, so a slice fits exactly one.
    const sliceOverrunMs = 20;
    let now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => now);
    codeToHtml.mockImplementation((source: string) => {
      now += sliceOverrunMs;
      return `<pre>${source}</pre>`;
    });

    const burst = ["a", "b", "c"].map((t) => highlightCode(`SELECT 1 FROM ${t}`, { lang: "sql" }));
    const highlightsPerTask: number[] = [];
    while (codeToHtml.mock.calls.length < burst.length) {
      const before = codeToHtml.mock.calls.length;
      await nextTask();
      highlightsPerTask.push(codeToHtml.mock.calls.length - before);
    }
    await Promise.all(burst);

    expect(Math.max(...highlightsPerTask)).toBe(1);
  });
});
