import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { MissionControlProvider, PluginScope } from "./context";
import { usePluginScope } from "./context-hooks";
import { invokePluginJson } from "./hooks";

describe("plugin hooks", () => {
  it("parses successful plugin JSON responses", async () => {
    const plugin = {
      invoke: vi.fn(async () =>
        new Response(JSON.stringify([{ sessionId: 42 }]), {
          headers: { "Content-Type": "application/json" },
        }),
      ),
    };

    await expect(invokePluginJson(plugin, "processes-list", { database: "main" })).resolves.toEqual([
      { sessionId: 42 },
    ]);
    expect(plugin.invoke).toHaveBeenCalledWith("processes-list", { database: "main" }, undefined);
  });

  it("throws response text for failed plugin responses", async () => {
    const plugin = {
      invoke: vi.fn(async () => new Response("plugin failed", { status: 500 })),
    };

    await expect(invokePluginJson(plugin, "processes-list")).rejects.toThrow("plugin failed");
  });

  it("scopes plugin instances from MissionControlProvider and PluginScope", () => {
    const fetchMock = vi.fn();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MissionControlProvider mode="proxy" baseUrl="/api/mission-control" fetch={fetchMock}>
        <PluginScope pluginRef="sql-server" configId="sql-1">{children}</PluginScope>
      </MissionControlProvider>
    );

    const { result } = renderHook(() => usePluginScope(), { wrapper });

    expect(result.current.pluginRef).toBe("sql-server");
    expect(result.current.configId).toBe("sql-1");
  });
});
