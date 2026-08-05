import { describe, expect, it } from "vitest";
import {
  ToolRenderRegistry,
  toolNameAdapter,
  type ToolRenderAdapter,
  type ToolRenderAdapterContext,
} from "./adapter";
import { createToolRenderRegistry, toToolRenderRegistry } from "./registry";
import type { DynamicToolUIPart, ToolMeta } from "../types";

function ctx(toolName: string): ToolRenderAdapterContext {
  return {
    part: {
      type: "dynamic-tool",
      toolName,
      toolCallId: "c1",
      state: "output-available",
      input: {},
      output: {},
    } as DynamicToolUIPart,
    toolName,
    state: "output-available",
    input: {},
    output: {},
    isError: false,
    defaultView: null,
    options: {},
  };
}

function adapter(id: string, toolName: string, surface: "input" | "output"): ToolRenderAdapter {
  const render = () => id;
  return {
    id,
    match: (c) => c.toolName === toolName,
    ...(surface === "input" ? { renderInput: render } : { renderOutput: render }),
  };
}

const TOOL: ToolMeta = { name: "pods_list", entity: "pods" };

describe("ToolRenderRegistry", () => {
  it("returns the first matching adapter for the surface", () => {
    const registry = new ToolRenderRegistry([
      adapter("first", "pods_list", "output"),
      adapter("second", "pods_list", "output"),
    ]);
    expect(registry.resolveOutput(ctx("pods_list"))).toBe("first");
  });

  it("resolves each surface independently, so an output-only adapter leaves the input alone", () => {
    const registry = new ToolRenderRegistry([adapter("out", "pods_list", "output")]);
    expect(registry.resolveOutput(ctx("pods_list"))).toBe("out");
    expect(registry.resolveInput(ctx("pods_list"))).toBeNull();
  });

  it("skips adapters whose match fails", () => {
    const registry = new ToolRenderRegistry([adapter("out", "pods_list", "output")]);
    expect(registry.resolveOutput(ctx("nodes_list"))).toBeNull();
  });

  it("looks a tool catalog entry up by name", () => {
    const registry = new ToolRenderRegistry([], { tools: [TOOL] });
    expect(registry.tool("pods_list")).toBe(TOOL);
    expect(registry.tool("unknown")).toBeUndefined();
  });

  it("merges options into a copy without mutating the original", () => {
    const registry = new ToolRenderRegistry([], { maxRows: 5 });
    const merged = registry.with({ tools: [TOOL] });
    expect(merged.options).toEqual({ maxRows: 5, tools: [TOOL] });
    expect(merged.tool("pods_list")).toBe(TOOL);
    expect(registry.options.tools).toBeUndefined();
    expect(merged.adapters).toBe(registry.adapters);
  });
});

describe("createToolRenderRegistry", () => {
  it("matches host adapters before the built-in defaults", () => {
    const registry = createToolRenderRegistry([adapter("host", "pods_list", "output")]);
    expect(registry.resolveOutput(ctx("pods_list"))).toBe("host");
    // The built-in catch-all still claims everything the host did not.
    expect(registry.resolveOutput(ctx("nodes_list"))).not.toBeNull();
  });

  it("always keeps a default renderer for every surface", () => {
    const registry = createToolRenderRegistry();
    expect(registry.resolveInput(ctx("anything"))).not.toBeNull();
    expect(registry.resolveOutput(ctx("anything"))).not.toBeNull();
  });
});

describe("toToolRenderRegistry", () => {
  it("builds a registry from an adapter array", () => {
    const registry = toToolRenderRegistry([adapter("host", "pods_list", "output")], {
      tools: [TOOL],
    });
    expect(registry.resolveOutput(ctx("pods_list"))).toBe("host");
    expect(registry.tool("pods_list")).toBe(TOOL);
  });

  it("reuses a supplied registry's adapters and folds the new options in", () => {
    const host = createToolRenderRegistry([adapter("host", "pods_list", "output")]);
    const merged = toToolRenderRegistry(host, { tools: [TOOL] });
    expect(merged.adapters).toBe(host.adapters);
    expect(merged.tool("pods_list")).toBe(TOOL);
  });

  it("falls back to the built-in defaults when nothing is supplied", () => {
    expect(toToolRenderRegistry(undefined).resolveOutput(ctx("anything"))).not.toBeNull();
  });
});

describe("toolNameAdapter", () => {
  const surfaces = { renderOutput: () => "matched" };

  it("matches an exact name, a name list and a pattern", () => {
    const exact = toolNameAdapter("a", "pods_list", surfaces);
    expect(exact.match(ctx("pods_list"))).toBe(true);
    expect(exact.match(ctx("pods_get"))).toBe(false);

    const list = toolNameAdapter("b", ["pods_list", "pods_get"], surfaces);
    expect(list.match(ctx("pods_get"))).toBe(true);
    expect(list.match(ctx("nodes_get"))).toBe(false);

    const pattern = toolNameAdapter("c", /^pods_/, surfaces);
    expect(pattern.match(ctx("pods_anything"))).toBe(true);
    expect(pattern.match(ctx("nodes_list"))).toBe(false);
  });
});
