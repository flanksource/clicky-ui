import { describe, expect, it, vi } from "vitest";
import { createNoopApi } from "../src/core/noop-api.js";
import { createPluginRegistry } from "../src/core/plugin-registry.js";
import { PluginSetupError } from "../src/errors.js";
import type { ToolbarButton } from "../src/types.js";

const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z"/></svg>';

const button = (id: string, overrides: Partial<ToolbarButton> = {}): ToolbarButton => ({
  id,
  label: `Button ${id}`,
  icon: svg,
  onClick: () => {},
  ...overrides,
});

const ids = (registry: ReturnType<typeof createPluginRegistry>) =>
  registry.store.toolbarButtons.map((entry) => entry.id);

describe("plugin toolbar buttons", () => {
  it("collects buttons declared on the plugin and returned from setup", () => {
    const registry = createPluginRegistry();

    registry.register(
      {
        name: "host",
        toolbarButtons: [button("declared")],
        setup: () => ({ toolbarButtons: [button("from-setup")] }),
      },
      createNoopApi(),
    );

    expect(ids(registry)).toEqual(["declared", "from-setup"]);
  });

  it("removes a plugin's buttons on unregister and keeps other plugins' buttons", () => {
    const registry = createPluginRegistry();
    registry.register({ name: "first", toolbarButtons: [button("one")] }, createNoopApi());
    registry.register({ name: "second", toolbarButtons: [button("two")] }, createNoopApi());

    registry.unregister("first");

    expect(ids(registry)).toEqual(["two"]);
  });

  it("clears every button when the registry is disposed", () => {
    const registry = createPluginRegistry();
    registry.register({ name: "host", toolbarButtons: [button("one")] }, createNoopApi());

    registry.dispose();

    expect(ids(registry)).toEqual([]);
  });

  it("replaces a plugin's buttons when it registers again under the same name", () => {
    const registry = createPluginRegistry();
    const pressed = vi.fn(() => true);
    registry.register({ name: "host", toolbarButtons: [button("one")] }, createNoopApi());

    registry.register(
      { name: "host", toolbarButtons: [button("one", { pressed })] },
      createNoopApi(),
    );

    expect(ids(registry)).toEqual(["one"]);
    expect(registry.store.toolbarButtons[0]?.pressed?.()).toBe(true);
  });

  it("rejects an id already used by another plugin and keeps the existing registration", () => {
    const registry = createPluginRegistry();
    registry.register({ name: "first", toolbarButtons: [button("shared")] }, createNoopApi());

    expect(() =>
      registry.register({ name: "second", toolbarButtons: [button("shared")] }, createNoopApi()),
    ).toThrow(PluginSetupError);
    expect(ids(registry)).toEqual(["shared"]);
    expect(registry.getPluginNames()).toEqual(["first"]);
  });

  it.each([
    ["an empty id", button("")],
    ["an empty label", button("labelless", { label: "" })],
    ["non-SVG icon markup", button("icon", { icon: "<img src=x>" })],
  ])("rejects a button with %s", (_name, invalid) => {
    const registry = createPluginRegistry();

    expect(() =>
      registry.register({ name: "host", toolbarButtons: [invalid] }, createNoopApi()),
    ).toThrow(PluginSetupError);
    expect(ids(registry)).toEqual([]);
  });
});
