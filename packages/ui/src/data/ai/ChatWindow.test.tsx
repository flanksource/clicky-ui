import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useEffect, type ReactNode } from "react";
import { ChatWindowManagerProvider } from "./ChatWindowManager";
import { useChatWindowManager } from "./chat-window-context";
import { ChatWindowLayer } from "./ChatWindow";
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

afterEach(() => localStorage.clear());

describe("ChatWindow tool approval default", () => {
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
});
