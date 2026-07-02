import {
  cleanup,
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatTransport, UIMessage, UIMessageChunk } from "ai";
import { useEffect, type ReactNode } from "react";
import { ChatWindowManagerProvider } from "./ChatWindowManager";
import { useChatWindowManager } from "./chat-window-context";
import { ChatWindowLayer } from "./ChatWindow";
import { chatWindowRequestBody } from "./ChatWindowRequestBody";
import { ToolPreferences, type ToolMeta } from "./ToolPreferences";
import { mockChatTransport } from "../chat/Chat.fixtures";

const TOOLS: ToolMeta[] = [
  { name: "listPods", label: "List Pods" },
  { name: "restartService", label: "Restart Service" },
];

function completeTurn(): ReadableStream<UIMessageChunk> {
  return new ReadableStream<UIMessageChunk>({
    start(controller) {
      controller.enqueue({ type: "start" });
      controller.enqueue({ type: "start-step" });
      controller.enqueue({ type: "finish-step" });
      controller.enqueue({ type: "finish" });
      controller.close();
    },
  });
}

function recordingTransport(sendMessages = vi.fn()): ChatTransport<UIMessage> {
  return {
    sendMessages(options) {
      sendMessages(options);
      return Promise.resolve(completeTurn());
    },
    reconnectToStream() {
      return Promise.resolve(null);
    },
  };
}

/** Opens one window on mount so ChatWindowLayer has a panel to render. */
function OpenOnMount({
  children,
  initialPrompt,
}: {
  children: ReactNode;
  initialPrompt?: { id: number; text: string } | null;
}) {
  const { openPanel } = useChatWindowManager();
  useEffect(() => {
    openPanel({ initialPrompt });
  }, [initialPrompt, openPanel]);
  return <>{children}</>;
}

beforeEach(() => installMemoryStorage());

afterEach(() => {
  cleanup();
  localStorage.clear();
});

function installMemoryStorage() {
  const values = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: storage,
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: storage,
  });
}

describe("ChatWindow tool approval default", () => {
  it("forwards rich context items alongside the serialized context summary", () => {
    const contextItems = [
      {
        id: "formula",
        type: "formula",
        label: "Formula Playground",
        fields: { entity: "Demo Co" },
        payload: { formula: "=tb.total", result: 42 },
      },
    ];

    expect(
      chatWindowRequestBody({
        base: { model: "test" },
        contextItems,
        tools: TOOLS,
        toolPrefs: { listPods: "enabled" },
      }),
    ).toEqual({
      model: "test",
      context: "Context:\n[formula] Formula Playground (entity: Demo Co)\n\n",
      contextItems,
      toolPreferences: { listPods: "enabled" },
    });
  });

  it('defaults every provided tool to "Ask" so calls pause for approval', async () => {
    render(
      <ChatWindowManagerProvider storageId="approval">
        <OpenOnMount>
          <ChatWindowLayer
            threadsApi={null}
            tools={TOOLS}
            chat={{ modelsApi: null, transport: mockChatTransport() }}
          />
        </OpenOnMount>
      </ChatWindowManagerProvider>,
    );

    // react-rnd loads lazily; wait for it to settle so its post-load re-render
    // doesn't unmount (and close) the popover we open below.
    await screen.findByTestId("tool-preferences-btn");
    await waitFor(() =>
      expect(document.querySelector(".react-draggable")).not.toBeNull(),
    );

    fireEvent.click(screen.getByTestId("tool-preferences-btn"));

    // Each tool row shows its mode badge; the default is "Ask", not "Auto".
    expect((await screen.findAllByText("Ask")).length).toBeGreaterThanOrEqual(
      TOOLS.length,
    );
    expect(screen.queryByText("Auto")).toBeNull();
  });

  it("can default provided tools to Auto when the backend owns approval policy", async () => {
    render(
      <ChatWindowManagerProvider storageId="approval-auto">
        <OpenOnMount>
          <ChatWindowLayer
            threadsApi={null}
            tools={TOOLS}
            defaultToolMode="enabled"
            chat={{ modelsApi: null, transport: mockChatTransport() }}
          />
        </OpenOnMount>
      </ChatWindowManagerProvider>,
    );

    await screen.findByTestId("tool-preferences-btn");
    await waitFor(() =>
      expect(document.querySelector(".react-draggable")).not.toBeNull(),
    );

    fireEvent.click(screen.getByTestId("tool-preferences-btn"));

    expect((await screen.findAllByText("Auto")).length).toBeGreaterThanOrEqual(
      TOOLS.length,
    );
    expect(screen.queryByText("Ask")).toBeNull();
  });

  it("shows individual tools and lets group headers toggle the group", async () => {
    const groupedTools: ToolMeta[] = [
      {
        name: "xero_accounts_list",
        label: "List Xero accounts",
        group: "Xero Read",
        preferenceKey: "Xero Read",
        defaultMode: "disabled",
      },
      {
        name: "xero_contacts_list",
        label: "List Xero contacts",
        group: "Xero Read",
        preferenceKey: "Xero Read",
        defaultMode: "disabled",
      },
      {
        name: "sync",
        label: "Sync",
        group: "Admin Write",
        preferenceKey: "Admin Write",
        defaultMode: "ask",
      },
    ];

    render(
      <ChatWindowManagerProvider storageId="approval-groups">
        <OpenOnMount>
          <ChatWindowLayer
            threadsApi={null}
            tools={groupedTools}
            chat={{ modelsApi: null, transport: mockChatTransport() }}
          />
        </OpenOnMount>
      </ChatWindowManagerProvider>,
    );

    await screen.findByTestId("tool-preferences-btn");
    await waitFor(() =>
      expect(document.querySelector(".react-draggable")).not.toBeNull(),
    );

    fireEvent.click(screen.getByTestId("tool-preferences-btn"));

    expect(await screen.findByText("Xero Read")).toBeInTheDocument();
    expect(screen.getByText("Admin Write")).toBeInTheDocument();
    expect(screen.getByText("List Xero accounts")).toBeInTheDocument();
    expect(screen.getByText("List Xero contacts")).toBeInTheDocument();
    expect(screen.getAllByText("Off").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Ask").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Collapse Xero Read" }));
    expect(screen.queryByText("List Xero accounts")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Toggle Xero Read group" }));
    expect(screen.getAllByText("Auto").length).toBeGreaterThan(0);
  });

  it("advanced tool preferences toggles individual tools and groups", async () => {
    const groupedTools: ToolMeta[] = [
      {
        name: "xero_accounts_list",
        label: "List Xero accounts",
        group: "Xero Read",
        preferenceKey: "Xero Read",
        defaultMode: "disabled",
        description: "List accounts from Xero",
      },
      {
        name: "xero_contacts_list",
        label: "List Xero contacts",
        group: "Xero Read",
        preferenceKey: "Xero Read",
        defaultMode: "disabled",
        description: "List contacts from Xero",
      },
      {
        name: "sync_xero",
        label: "Sync Xero",
        group: "Admin Write",
        preferenceKey: "Admin Write",
        defaultMode: "ask",
        description: "Synchronize Xero data",
      },
    ];
    const onChange = vi.fn();

    render(
      <ToolPreferences
        tools={groupedTools}
        value={{ xero_accounts_list: "disabled", xero_contacts_list: "disabled" }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByTestId("tool-preferences-btn"));
    fireEvent.click(await screen.findByText("Advanced"));

    const dialog = await screen.findByRole("dialog", {
      name: "Advanced Chat Settings",
    });
    fireEvent.click(within(dialog).getByRole("button", { name: /permissions/i }));
    expect(within(dialog).getByText("Admin Write")).toBeInTheDocument();
    expect(within(dialog).getByText("Xero Read")).toBeInTheDocument();
    expect(within(dialog).getByText("List Xero accounts")).toBeInTheDocument();
    expect(within(dialog).getByText("List Xero contacts")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Description for List Xero accounts"),
    ).toHaveAttribute("title", "List accounts from Xero");

    fireEvent.click(within(dialog).getByText("List Xero accounts"));
    expect(onChange).toHaveBeenCalledWith({
      xero_accounts_list: "enabled",
      xero_contacts_list: "disabled",
    });

    fireEvent.click(within(dialog).getByRole("button", { name: "Toggle Xero Read group" }));
    expect(onChange).toHaveBeenLastCalledWith({
      xero_accounts_list: "enabled",
      xero_contacts_list: "enabled",
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
    expect(within(select).getByRole("option", { name: "Default" })).toBeInTheDocument();
    expect(within(select).getByRole("option", { name: "Accept edits" })).toBeInTheDocument();
    expect(within(select).getByRole("option", { name: "Bypass" })).toBeInTheDocument();

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
      expect(within(dialog).getAllByText("search_docs").length).toBeGreaterThan(0),
    );
    expect(within(dialog).getAllByText("Search docs").length).toBeGreaterThan(0);
    expect(within(dialog).getByText("Hints")).toBeInTheDocument();
    expect(within(dialog).getByText("Quote exact phrases for narrower results.")).toBeInTheDocument();
    expect(within(dialog).getByText("query")).toBeInTheDocument();
    expect(within(dialog).getByText("Search query")).toBeInTheDocument();
  });

  it("passes panel initial prompts into the inner chat", async () => {
    const sendMessages = vi.fn();

    render(
      <ChatWindowManagerProvider storageId="initial-prompt">
        <OpenOnMount initialPrompt={{ id: 1, text: "Fix this formula" }}>
          <ChatWindowLayer
            threadsApi={null}
            toolsApi={null}
            chat={{
              modelsApi: null,
              transport: recordingTransport(sendMessages),
            }}
          />
        </OpenOnMount>
      </ChatWindowManagerProvider>,
    );

    await waitFor(() => expect(sendMessages).toHaveBeenCalledTimes(1));
    expect(JSON.stringify(sendMessages.mock.calls[0]?.[0])).toContain(
      "Fix this formula",
    );
  });
});
