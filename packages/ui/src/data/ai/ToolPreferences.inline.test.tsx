import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MOCK_MODELS } from "../chat/Chat.fixtures";
import type { ToolMeta, ToolPolicy } from "../chat/types";
import { AdvancedChatSettings, ToolPreferencesMenu } from "./ToolPreferences";

const TOOLS: ToolMeta[] = [
  {
    name: "xero_accounts_list",
    label: "List Xero accounts",
    group: "Xero",
    defaultPermission: "deny",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "sync_finance",
    label: "Sync finance",
    group: "Admin Write",
    defaultPermission: "ask",
    inputSchema: { type: "object", properties: {} },
  },
];

const VALUE: Record<string, ToolPolicy> = {
  xero_accounts_list: "deny",
  sync_finance: "ask",
};

describe("AdvancedChatSettings", () => {
  it("has no Generation section in Config", () => {
    render(
      <AdvancedChatSettings tools={TOOLS} value={VALUE} onRule={vi.fn()} />,
    );

    expect(screen.queryByText("Generation")).toBeNull();
    expect(screen.queryByText("Temperature")).toBeNull();
    expect(screen.queryByText("Max tokens")).toBeNull();
  });

  it("renders the tabbed settings inline and switches tabs without a dialog", () => {
    render(
      <AdvancedChatSettings
        tools={TOOLS}
        value={VALUE}
        onRule={vi.fn()}
        models={MOCK_MODELS}
      />,
    );

    expect(screen.getByText("Runtime")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /^(config|costs|permissions)$/i }),
    ).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: /permissions/i }));
    expect(screen.getByPlaceholderText("Search tools")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Toggle Xero group" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens on the requested default tab", () => {
    render(
      <AdvancedChatSettings
        tools={TOOLS}
        value={VALUE}
        onRule={vi.fn()}
        defaultTab="permissions"
      />,
    );

    expect(screen.getByPlaceholderText("Search tools")).toBeInTheDocument();
  });
});

describe("ToolPreferencesMenu", () => {
  it("opens the tree expanded and reports Advanced clicks", () => {
    const onAdvanced = vi.fn();
    render(
      <ToolPreferencesMenu
        tools={TOOLS}
        value={VALUE}
        onRule={vi.fn()}
        onAdvanced={onAdvanced}
      />,
    );

    expect(screen.getByText("Tool Preferences")).toBeInTheDocument();
    expect(screen.getByText("List Xero accounts")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Collapse Xero" }));
    expect(screen.queryByText("List Xero accounts")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Advanced" }));
    expect(onAdvanced).toHaveBeenCalledTimes(1);
  });

  it("toggles a tool's policy from its badge", () => {
    const onRule = vi.fn();
    render(<ToolPreferencesMenu tools={TOOLS} value={VALUE} onRule={onRule} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Toggle List Xero accounts" }),
    );
    expect(onRule).toHaveBeenCalledWith({
      name: "xero_accounts_list",
      policy: "allow",
    });
  });

  it("omits the Advanced action when no handler is given", () => {
    render(
      <ToolPreferencesMenu tools={TOOLS} value={VALUE} onRule={vi.fn()} />,
    );

    expect(screen.queryByRole("button", { name: "Advanced" })).toBeNull();
  });
});
