import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChatWindowLayer } from "./ChatWindow";
import { ChatWindowManagerProvider } from "./ChatWindowManager";
import { ToolPreferences, type ToolMeta } from "./ToolPreferences";
import { mockChatTransport } from "../chat/Chat.fixtures";
import {
  CHAT_WINDOW_TEST_TOOLS,
  OpenChatWindowOnMount,
  installMemoryStorage,
} from "./ChatWindow.test-utils";

beforeEach(() => installMemoryStorage());

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("ChatWindow tool approval default", () => {
  it('defaults every provided tool to "Ask" so calls pause for approval', async () => {
    render(
      <ChatWindowManagerProvider storageId="approval">
        <OpenChatWindowOnMount>
          <ChatWindowLayer
            threadsApi={null}
            tools={CHAT_WINDOW_TEST_TOOLS}
            chat={{ modelsApi: null, transport: mockChatTransport() }}
          />
        </OpenChatWindowOnMount>
      </ChatWindowManagerProvider>,
    );

    await screen.findByTestId("tool-preferences-btn");
    await waitFor(() =>
      expect(document.querySelector(".react-draggable")).not.toBeNull(),
    );

    fireEvent.click(screen.getByTestId("tool-preferences-btn"));
    fireEvent.click(await screen.findByRole("button", { name: "Expand Tools" }));

    for (const tool of CHAT_WINDOW_TEST_TOOLS) {
      const row = screen.getByTitle(tool.name);
      expect(within(row).getByText(tool.label)).toBeInTheDocument();
      expect(within(row).getByText("Ask")).toBeInTheDocument();
    }
    expect(screen.queryByText("Auto")).toBeNull();
  });

  it("can default provided tools to Auto when the backend owns approval policy", async () => {
    render(
      <ChatWindowManagerProvider storageId="approval-auto">
        <OpenChatWindowOnMount>
          <ChatWindowLayer
            threadsApi={null}
            tools={CHAT_WINDOW_TEST_TOOLS}
            defaultToolMode="auto"
            chat={{ modelsApi: null, transport: mockChatTransport() }}
          />
        </OpenChatWindowOnMount>
      </ChatWindowManagerProvider>,
    );

    await screen.findByTestId("tool-preferences-btn");
    await waitFor(() =>
      expect(document.querySelector(".react-draggable")).not.toBeNull(),
    );

    fireEvent.click(screen.getByTestId("tool-preferences-btn"));
    fireEvent.click(await screen.findByRole("button", { name: "Expand Tools" }));

    for (const tool of CHAT_WINDOW_TEST_TOOLS) {
      const row = screen.getByTitle(tool.name);
      expect(within(row).getByText(tool.label)).toBeInTheDocument();
      expect(within(row).getByText("Auto")).toBeInTheDocument();
    }
    expect(screen.queryByText("Ask")).toBeNull();
  });

  it("shows individual tools and lets group headers toggle the group", async () => {
    const groupedTools: ToolMeta[] = [
      {
        name: "xero_accounts_list",
        label: "List Xero accounts",
        group: "Xero Read",
        preferenceKey: "Xero Read",
        defaultPermission: "off",
      },
      {
        name: "xero_contacts_list",
        label: "List Xero contacts",
        group: "Xero Read",
        preferenceKey: "Xero Read",
        defaultPermission: "off",
      },
      {
        name: "sync",
        label: "Sync",
        group: "Admin Write",
        preferenceKey: "Admin Write",
        defaultPermission: "ask",
      },
    ];

    render(
      <ChatWindowManagerProvider storageId="approval-groups">
        <OpenChatWindowOnMount>
          <ChatWindowLayer
            threadsApi={null}
            tools={groupedTools}
            chat={{ modelsApi: null, transport: mockChatTransport() }}
          />
        </OpenChatWindowOnMount>
      </ChatWindowManagerProvider>,
    );

    await screen.findByTestId("tool-preferences-btn");
    await waitFor(() =>
      expect(document.querySelector(".react-draggable")).not.toBeNull(),
    );

    fireEvent.click(screen.getByTestId("tool-preferences-btn"));

    expect(await screen.findByText("Xero Read")).toBeInTheDocument();
    expect(screen.getByText("Admin Write")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Expand Xero Read" }));
    fireEvent.click(screen.getByRole("button", { name: "Expand Admin Write" }));
    expect(screen.getByText("List Xero accounts")).toBeInTheDocument();
    expect(screen.getByText("List Xero contacts")).toBeInTheDocument();
    expect(screen.getAllByText("Off").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Ask").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Collapse Xero Read" }));
    expect(screen.queryByText("List Xero accounts")).toBeNull();
    const groupToggle = screen.getByRole("button", {
      name: "Toggle Xero Read group",
    });
    fireEvent.click(within(groupToggle).getByText("Off"));
    expect(screen.getAllByText("On").length).toBeGreaterThan(0);
  });

  it("advanced permissions tab uses the same click-toggle tool list as the dropdown", async () => {
    const groupedTools: ToolMeta[] = [
      {
        name: "xero_accounts_list",
        label: "List Xero accounts",
        group: "Xero Read",
        preferenceKey: "Xero Read",
        defaultPermission: "off",
        description: "List accounts from Xero",
      },
      {
        name: "xero_contacts_list",
        label: "List Xero contacts",
        group: "Xero Read",
        preferenceKey: "Xero Read",
        defaultPermission: "off",
        description: "List contacts from Xero",
      },
      {
        name: "sync_xero",
        label: "Sync Xero",
        group: "Admin Write",
        preferenceKey: "Admin Write",
        defaultPermission: "ask",
        description: "Synchronize Xero data",
      },
    ];
    const onChange = vi.fn();

    render(
      <ToolPreferences
        tools={groupedTools}
        value={{ xero_accounts_list: "off", xero_contacts_list: "off" }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByTestId("tool-preferences-btn"));
    fireEvent.click(await screen.findByText("Advanced"));

    const dialog = await screen.findByRole("dialog", {
      name: "Advanced Chat Settings",
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: /permissions/i }),
    );
    expect(within(dialog).getByText("Admin Write")).toBeInTheDocument();
    expect(within(dialog).getByText("Xero Read")).toBeInTheDocument();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Expand Xero Read" }),
    );
    expect(within(dialog).getByText("List Xero accounts")).toBeInTheDocument();
    expect(within(dialog).getByText("List Xero contacts")).toBeInTheDocument();
    expect(
      within(dialog).queryByLabelText("Info for List Xero accounts"),
    ).toBeNull();
    expect(
      within(dialog).queryByRole("radiogroup", {
        name: "List Xero accounts policy",
      }),
    ).toBeNull();

    fireEvent.click(
      within(dialog).getByRole("button", { name: /List Xero accounts/ }),
    );
    expect(onChange).toHaveBeenCalledWith({
      xero_accounts_list: "on",
      xero_contacts_list: "off",
    });

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Toggle Xero Read group" }),
    );
    expect(onChange).toHaveBeenLastCalledWith({
      xero_accounts_list: "on",
      xero_contacts_list: "on",
    });
  });

  it("advanced config exposes model-level Claude permission modes", async () => {
    const onPermissionModeChange = vi.fn();

    render(
      <ToolPreferences
        tools={[]}
        value={{}}
        onChange={vi.fn()}
        permissionMode="default"
        onPermissionModeChange={onPermissionModeChange}
      />,
    );

    fireEvent.click(screen.getByTestId("tool-preferences-btn"));
    fireEvent.click(await screen.findByText("Advanced"));

    const dialog = await screen.findByRole("dialog", {
      name: "Advanced Chat Settings",
    });
    const select = within(dialog).getByRole("combobox", {
      name: "Permission mode",
    });
    expect(
      within(select).getByRole("option", { name: "Default" }),
    ).toBeInTheDocument();
    expect(
      within(select).getByRole("option", { name: "Accept edits" }),
    ).toBeInTheDocument();
    expect(
      within(select).getByRole("option", { name: "Bypass" }),
    ).toBeInTheDocument();

    fireEvent.change(select, { target: { value: "bypassPermissions" } });
    expect(onPermissionModeChange).toHaveBeenCalledWith("bypassPermissions");
  });

  it("advanced tool browser renders generated input schemas", async () => {
    render(
      <ToolPreferences
        tools={[
          {
            name: "search_docs",
            label: "Search docs",
            source: "mcp",
            server: "docs",
            inputSchema: {
              type: "object",
              properties: {
                query: { type: "string", description: "Search query" },
              },
              required: ["query"],
            },
            hints: ["Quote exact phrases for narrower results."],
          },
        ]}
        value={{}}
        onChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId("tool-preferences-btn"));
    fireEvent.click(await screen.findByText("Advanced"));
    const dialog = await screen.findByRole("dialog", {
      name: "Advanced Chat Settings",
    });
    fireEvent.click(within(dialog).getByRole("button", { name: /browser/i }));

    await waitFor(() =>
      expect(within(dialog).getAllByText("search_docs").length).toBeGreaterThan(
        0,
      ),
    );
    expect(within(dialog).getAllByText("Search docs").length).toBeGreaterThan(
      0,
    );
    expect(within(dialog).getByText("Hints")).toBeInTheDocument();
    expect(
      within(dialog).getByText("Quote exact phrases for narrower results."),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("query")).toBeInTheDocument();
    expect(within(dialog).getByText("Search query")).toBeInTheDocument();
  });

  it("normalizes fetched catalog strictness and annotations for the tool browser", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              tools: [
                {
                  name: "backend_search",
                  label: "Backend search",
                  parent: "Knowledge",
                  entity: "docs",
                  strict: true,
                  annotations: {
                    title: "Backend search title",
                    readOnlyHint: true,
                    idempotentHint: true,
                  },
                  inputSchema: {
                    type: "object",
                    properties: {
                      query: { type: "string", description: "Backend query" },
                    },
                    additionalProperties: false,
                  },
                },
              ],
            }),
        }),
      ),
    );

    render(
      <ChatWindowManagerProvider storageId="fetched-tools">
        <OpenChatWindowOnMount>
          <ChatWindowLayer
            threadsApi={null}
            chat={{ modelsApi: null, transport: mockChatTransport() }}
          />
        </OpenChatWindowOnMount>
      </ChatWindowManagerProvider>,
    );

    await screen.findByTestId("tool-preferences-btn");
    await waitFor(() =>
      expect(document.querySelector(".react-draggable")).not.toBeNull(),
    );

    fireEvent.click(screen.getByTestId("tool-preferences-btn"));
    fireEvent.click(await screen.findByText("Advanced"));
    const dialog = await screen.findByRole("dialog", {
      name: "Advanced Chat Settings",
    });
    fireEvent.click(within(dialog).getByRole("button", { name: /browser/i }));

    await waitFor(() =>
      expect(
        within(dialog).getAllByText("backend_search").length,
      ).toBeGreaterThan(0),
    );
    expect(within(dialog).getAllByText("Knowledge").length).toBeGreaterThan(0);
    expect(within(dialog).getAllByText("readOnlyHint").length).toBeGreaterThan(
      0,
    );
    expect(
      within(dialog).getAllByText("idempotentHint").length,
    ).toBeGreaterThan(0);
    expect(within(dialog).getAllByText("Strict").length).toBeGreaterThan(0);
  });
});
