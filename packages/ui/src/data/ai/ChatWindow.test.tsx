import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useEffect, type ReactNode } from "react";
import { ChatWindowManagerProvider } from "./ChatWindowManager";
import { useChatWindowManager } from "./chat-window-context";
import { ChatWindowLayer, chatWindowRequestBody } from "./ChatWindow";
import type { ToolMeta } from "./ToolPreferences";
import { mockChatTransport } from "../chat/Chat.fixtures";

const TOOLS: ToolMeta[] = [
  { name: "listPods", label: "List Pods" },
  { name: "restartService", label: "Restart Service" },
];

/** Opens one window on mount so ChatWindowLayer has a panel to render. */
function OpenOnMount({ children }: { children: ReactNode }) {
  const { openPanel } = useChatWindowManager();
  useEffect(() => {
    openPanel();
  }, [openPanel]);
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
  Object.defineProperty(window, "localStorage", { configurable: true, value: storage });
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
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

    expect(chatWindowRequestBody({
      base: { model: "test" },
      contextItems,
      tools: TOOLS,
      toolPrefs: { listPods: "enabled" },
    })).toEqual({
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
    await waitFor(() => expect(document.querySelector(".react-draggable")).not.toBeNull());

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
    await waitFor(() => expect(document.querySelector(".react-draggable")).not.toBeNull());

    fireEvent.click(screen.getByTestId("tool-preferences-btn"));

    expect(await screen.findAllByText("Auto")).toHaveLength(TOOLS.length);
    expect(screen.queryByText("Ask")).toBeNull();
  });
});
