import { describe, expect, it } from "vitest";
import { createTestRunnerRegistry, type TestNodeAdapter } from "./adapter";
import type { TestRunnerContext } from "./context";
import type { Test } from "./types";

const node = (name: string): Test => ({ name });

// A minimal runner context — the registry only forwards it to match()/render().
const runner = { tests: [] } as unknown as TestRunnerContext;

const adapter = (id: string, over: Partial<TestNodeAdapter>): TestNodeAdapter => ({
  id,
  match: () => true,
  ...over,
});

describe("TestNodeAdapterRegistry.resolveDetail", () => {
  it("returns the first matching adapter that has renderDetail", () => {
    const reg = createTestRunnerRegistry([
      adapter("no-detail", { match: () => true }),
      adapter("first", { match: () => true, renderDetail: () => "A" }),
      adapter("second", { match: () => true, renderDetail: () => "B" }),
    ]);
    expect(reg.resolveDetail(node("x"), runner)?.id).toBe("first");
  });

  it("skips adapters whose match returns false", () => {
    const reg = createTestRunnerRegistry([
      adapter("skip", { match: (n) => n.name === "other", renderDetail: () => "A" }),
      adapter("hit", { match: (n) => n.name === "x", renderDetail: () => "B" }),
    ]);
    expect(reg.resolveDetail(node("x"), runner)?.id).toBe("hit");
  });

  it("returns null when no adapter contributes a detail body (default fallback)", () => {
    const reg = createTestRunnerRegistry([adapter("leading-only", { renderRowLeading: () => "•" })]);
    expect(reg.resolveDetail(node("x"), runner)).toBeNull();
  });
});

describe("TestNodeAdapterRegistry.resolveFrameworkIcon", () => {
  it("returns the first matching adapter that overrides the framework icon", () => {
    const reg = createTestRunnerRegistry([
      adapter("plain", { renderRowLeading: () => "•" }),
      adapter("logo", { renderFrameworkIcon: () => "logo" }),
    ]);
    expect(reg.resolveFrameworkIcon(node("x"), runner)?.id).toBe("logo");
  });

  it("returns null when no adapter overrides it (the built-in tool mark wins)", () => {
    const reg = createTestRunnerRegistry([adapter("a", { renderDetail: () => "d" })]);
    expect(reg.resolveFrameworkIcon(node("x"), runner)).toBeNull();
  });
});

describe("TestNodeAdapterRegistry.resolveTabs", () => {
  it("merges tabs across all matching adapters in registration order", () => {
    const reg = createTestRunnerRegistry([
      adapter("a", { detailTabs: () => [{ id: "source", label: "Source", render: () => null }] }),
      adapter("b", { detailTabs: () => [{ id: "context", label: "Context", render: () => null }] }),
    ]);
    expect(reg.resolveTabs(node("x"), runner).map((t) => t.id)).toEqual(["source", "context"]);
  });

  it("de-duplicates tabs by id, first contributor wins", () => {
    const reg = createTestRunnerRegistry([
      adapter("a", { detailTabs: () => [{ id: "source", label: "First", render: () => null }] }),
      adapter("b", { detailTabs: () => [{ id: "source", label: "Second", render: () => null }] }),
    ]);
    const tabs = reg.resolveTabs(node("x"), runner);
    expect(tabs).toHaveLength(1);
    expect(tabs[0].label).toBe("First");
  });
});

describe("TestNodeAdapterRegistry.resolveCopy", () => {
  it("merges copy sections across every matching adapter in registration order, first wins per title/label", () => {
    const reg = createTestRunnerRegistry([
      adapter("skip", {
        match: (n) => n.name === "other",
        copy: () => ({ brief: [{ title: "Skipped", body: "never" }] }),
      }),
      adapter("command", {
        copy: () => ({
          brief: [{ title: "Command", lang: "sh", body: "$ todos --help" }],
          items: [{ label: "Copy command", value: "todos --help" }],
        }),
      }),
      adapter("no-copy", { renderDetail: () => "d" }),
      adapter("recording", {
        copy: () => ({
          facts: [{ label: "Recording", value: "http" }],
          brief: [
            { title: "Command", body: "$ shadowed" },
            { title: "Recording", body: "kind: http" },
          ],
          items: [
            { label: "Copy command", value: "shadowed" },
            { label: "Copy recording path", reason: "stored in a recordstore stream" },
          ],
        }),
      }),
    ]);

    expect(reg.resolveCopy(node("x"), runner)).toEqual({
      facts: [{ label: "Recording", value: "http" }],
      brief: [
        { title: "Command", lang: "sh", body: "$ todos --help" },
        { title: "Recording", body: "kind: http" },
      ],
      items: [
        { label: "Copy command", value: "todos --help" },
        { label: "Copy recording path", reason: "stored in a recordstore stream" },
      ],
    });
  });

  it("returns empty facts, brief and items when no adapter contributes copy", () => {
    const reg = createTestRunnerRegistry([adapter("a", { renderDetail: () => "d" })]);
    expect(reg.resolveCopy(node("x"), runner)).toEqual({ facts: [], brief: [], items: [] });
  });
});

describe("TestNodeAdapterRegistry.ownsScroll", () => {
  it("is false when no detail adapter matches", () => {
    expect(createTestRunnerRegistry([]).ownsScroll(node("x"), runner)).toBe(false);
  });

  it("reflects the resolved detail adapter's ownsScroll", () => {
    const reg = createTestRunnerRegistry([
      adapter("d", { renderDetail: () => "A", ownsScroll: () => true }),
    ]);
    expect(reg.ownsScroll(node("x"), runner)).toBe(true);
  });
});
