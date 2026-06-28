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
    expect(await screen.findAllByText("Ask")).toHaveLength(TOOLS.length);
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

    expect(await screen.findAllByText("Auto")).toHaveLength(TOOLS.length);
    expect(screen.queryByText("Ask")).toBeNull();
  });

  it("collapses tools by preference key and uses each group default", async () => {
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

    expect(await screen.findAllByText("Xero Read")).toHaveLength(2);
    expect(screen.getAllByText("Admin Write")).toHaveLength(2);
    expect(screen.queryByText("List Xero accounts")).toBeNull();
    expect(screen.queryByText("List Xero contacts")).toBeNull();
    expect(screen.getByText("Off")).toBeInTheDocument();
    expect(screen.getByText("Ask")).toBeInTheDocument();
  });

  it("advanced tool preferences shows individual tools with description tooltips", async () => {
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
        value={{ "Xero Read": "disabled" }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByTestId("tool-preferences-btn"));
    fireEvent.click(await screen.findByText("Advanced"));

    const dialog = await screen.findByRole("dialog", {
      name: "Advanced Tool Preferences",
    });
    expect(within(dialog).getByText("Admin Write")).toBeInTheDocument();
    expect(within(dialog).getByText("Xero Read")).toBeInTheDocument();
    expect(within(dialog).getByText("xero_accounts_list")).toBeInTheDocument();
    expect(within(dialog).getByText("xero_contacts_list")).toBeInTheDocument();
    expect(within(dialog).queryByText("List Xero accounts")).toBeNull();
    expect(
      screen.getByLabelText("Description for xero_accounts_list"),
    ).toHaveAttribute("title", "List accounts from Xero");

    const row = within(dialog).getByText("xero_accounts_list").closest("button");
    expect(row?.className).toContain("h-9");
    fireEvent.click(row!);
    expect(onChange).toHaveBeenCalledWith({
      "Xero Read": "disabled",
      xero_accounts_list: "enabled",
    });
  });

  it("passes panel initial prompts into the inner chat", async () => {
    const sendMessages = vi.fn();

    render(
      <ChatWindowManagerProvider storageId="initial-prompt">
        <OpenOnMount initialPrompt={{ id: 1, text: "Fix this formula" }}>
          <ChatWindowLayer
            threadsApi={null}
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
