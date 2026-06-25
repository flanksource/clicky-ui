import { describe, expect, it } from "vitest";
import {
  classifyCommand,
  classifyToolCategory,
  collectSessionFilters,
  isEventVisible,
  type SessionVisibility,
} from "./session-categories";
import { normalizeSession, type SessionEvent } from "./SessionViewer.model";
import { SAMPLE_SESSION } from "./SessionViewer.fixtures";

describe("classifyToolCategory", () => {
  const cases: Array<[string, Record<string, unknown> | undefined, string]> = [
    ["Read", { file_path: "a.ts" }, "explore"],
    ["Grep", { pattern: "x" }, "explore"],
    ["WebFetch", { url: "https://x" }, "explore"],
    ["Edit", { file_path: "a.ts" }, "edit"],
    ["Write", { file_path: "a.ts" }, "edit"],
    ["Task", { description: "x" }, "plan"],
    ["TodoWrite", {}, "plan"],
    ["AskUserQuestion", {}, "clarify"],
    ["KillShell", {}, "run"],
    ["SomethingNew", {}, "other"],
  ];
  it.each(cases)("maps tool %s to its category", (tool, input, expected) => {
    expect(classifyToolCategory(tool, input)).toBe(expected);
  });

  it("treats a .claude/plans/ path as the plan category regardless of tool", () => {
    expect(classifyToolCategory("Write", { file_path: "/repo/.claude/plans/x.md" })).toBe("plan");
  });

  it("classifies Bash by its command, mirroring captain", () => {
    expect(classifyToolCategory("Bash", { command: "go test ./..." })).toBe("test");
    expect(classifyToolCategory("Bash", { command: "git status" })).toBe("explore");
    expect(classifyToolCategory("Bash", { command: "git commit -m x" })).toBe("git");
    expect(classifyToolCategory("Bash", { command: "pnpm install" })).toBe("install");
    expect(classifyToolCategory("Bash", { command: "kubectl get pods" })).toBe("k8s");
    expect(classifyToolCategory("Bash", { command: "docker build ." })).toBe("docker");
    expect(classifyToolCategory("Bash", { command: "rm -rf dist" })).toBe("cleanup");
  });
});

describe("classifyCommand", () => {
  it.each([
    ["make build", "build"],
    ["go run main.go", "run"],
    ["golangci-lint run", "lint"],
    ["", "other"],
    ["frobnicate --hard", "other"],
  ])("classifies %s as %s", (command, expected) => {
    expect(classifyCommand(command)).toBe(expected);
  });
});

describe("collectSessionFilters", () => {
  const filters = collectSessionFilters(normalizeSession(SAMPLE_SESSION));

  it("collects the categories present, ordered by descending impact priority", () => {
    expect(filters.categories).toEqual(["edit", "explore", "plan", "other"]);
  });

  it("collects one labelled facet per distinct tool", () => {
    expect(filters.tools).toHaveLength(6);
    expect(filters.tools.map((t) => t.key)).toEqual(
      expect.arrayContaining(["Read", "Grep", "Bash", "Task", "Write", "mcp__iconify__search_icons"]),
    );
    expect(filters.tools.find((t) => t.key === "Read")?.label).toBe("Read file");
  });

  it("collects the distinct sources present", () => {
    expect(filters.sources).toEqual(["claude"]);
  });
});

describe("isEventVisible", () => {
  const readEvent = normalizeSession(SAMPLE_SESSION).find((e) => e.tool === "Read") as SessionEvent;
  const base: SessionVisibility = {
    hiddenCategories: new Set(),
    hiddenTools: new Set(),
    hiddenSources: new Set(),
    showThinking: true,
  };

  it("hides a tool event when its category is hidden", () => {
    expect(isEventVisible(readEvent, { ...base, hiddenCategories: new Set(["explore"]) })).toBe(false);
  });

  it("hides a tool event when its specific tool is hidden", () => {
    expect(isEventVisible(readEvent, { ...base, hiddenTools: new Set(["Read"]) })).toBe(false);
  });

  it("hides a tool event when its source is hidden", () => {
    expect(isEventVisible(readEvent, { ...base, hiddenSources: new Set(["claude"]) })).toBe(false);
  });

  it("gates reasoning events on showThinking but always shows user events", () => {
    const thinking: SessionEvent = { id: "t", kind: "thinking", text: "…" };
    const user: SessionEvent = { id: "u", kind: "user", text: "hi" };
    expect(isEventVisible(thinking, { ...base, showThinking: false })).toBe(false);
    expect(isEventVisible(user, { ...base, hiddenCategories: new Set(["explore"]) })).toBe(true);
  });
});
