import { describe, expect, it } from "vitest";
import type { AISpecRuntimeValue } from "../SpecRuntimeEditor.model";
import {
  checkoutMode,
  parseOptionalNumber,
  stashMode,
  withBudgetValue,
  withCheckoutMode,
  withOptionalRoot,
  withStashMode,
  withWorktreeMode,
  worktreeMode,
} from "./update";

const CHECKED_OUT: AISpecRuntimeValue = {
  setup: {
    checkout: {
      mode: "remote",
      url: "https://github.com/flanksource/clicky-ui.git",
      connection: "github",
      ref: "main",
      depth: 1,
      worktree: {
        mode: "new",
        prefix: "ai",
        base: "main",
        path: ".shell/worktrees/runtime",
        keep: true,
      },
      dirty: { stash: "all", since: "origin/main" },
    },
  },
};

describe("update helpers", () => {
  it("clears dependent checkout fields when switching modes", () => {
    const none = withCheckoutMode(CHECKED_OUT, "none");
    expect(none.setup?.checkout).toMatchObject({
      mode: "none",
      url: "",
      path: "",
      connection: "",
      ref: "",
      depth: 0,
    });

    const local = withCheckoutMode(CHECKED_OUT, "local");
    expect(local.setup?.checkout).toMatchObject({
      mode: "local",
      url: "",
      connection: "",
      ref: "main",
    });

    const remote = withCheckoutMode(
      { setup: { checkout: { mode: "local", path: "/repo" } } },
      "remote",
    );
    expect(remote.setup?.checkout).toMatchObject({ mode: "remote", path: "" });
  });

  it("clears worktree fields when switching modes", () => {
    const none = withWorktreeMode(CHECKED_OUT, "none");
    expect(none.setup?.checkout?.worktree).toEqual({
      mode: "none",
      prefix: "",
      base: "",
      path: "",
      keep: false,
    });

    const existing = withWorktreeMode(CHECKED_OUT, "existing");
    expect(existing.setup?.checkout?.worktree).toEqual({
      mode: "existing",
      prefix: "",
      base: "",
      path: ".shell/worktrees/runtime",
      keep: false,
    });
  });

  it("clears since only when stash resets to none", () => {
    const none = withStashMode(CHECKED_OUT, "none");
    expect(none.setup?.checkout?.dirty).toEqual({ stash: "none", since: "" });

    const staged = withStashMode(CHECKED_OUT, "staged");
    expect(staged.setup?.checkout?.dirty).toEqual({
      stash: "staged",
      since: "origin/main",
    });
  });

  it("derives segmented modes from partially-set specs", () => {
    expect(checkoutMode({})).toBe("none");
    expect(checkoutMode({ setup: { checkout: { path: "/repo" } } })).toBe(
      "local",
    );
    expect(checkoutMode(CHECKED_OUT)).toBe("remote");
    expect(worktreeMode({})).toBe("none");
    expect(worktreeMode(CHECKED_OUT)).toBe("new");
    expect(stashMode({})).toBe("none");
    expect(stashMode(CHECKED_OUT)).toBe("all");
  });

  it("drops cleared budget and root values instead of keeping empties", () => {
    const value: AISpecRuntimeValue = {
      temperature: 0.2,
      budget: { cost: 0.5, maxTokens: 8000 },
    };
    expect(withBudgetValue(value, "cost", undefined).budget).toEqual({
      maxTokens: 8000,
    });
    expect(withBudgetValue(value, "timeout", "30m").budget).toEqual({
      cost: 0.5,
      maxTokens: 8000,
      timeout: "30m",
    });
    expect(
      withOptionalRoot(value, "temperature", undefined),
    ).not.toHaveProperty("temperature");
  });

  it("parses optional numbers with integer clamping", () => {
    expect(parseOptionalNumber("")).toBeUndefined();
    expect(parseOptionalNumber("abc")).toBeUndefined();
    expect(parseOptionalNumber("0.7")).toBe(0.7);
    expect(parseOptionalNumber("2.9", true)).toBe(2);
    expect(parseOptionalNumber("-3", true)).toBe(0);
  });
});
