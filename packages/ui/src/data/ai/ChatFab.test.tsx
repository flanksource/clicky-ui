import { act, fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { describe, expect, it } from "vitest";
import { ChatWindowManagerProvider } from "./ChatWindowManager";
import { useChatWindowManager } from "./chat-window-context";
import { ChatButton } from "./ChatButton";
import { ChatFab } from "./ChatFab";

function OpenPanelOnMount() {
  const { openPanel } = useChatWindowManager();
  useEffect(() => {
    openPanel();
  }, [openPanel]);
  return null;
}

function PanelCount() {
  const { panels } = useChatWindowManager();
  return <output aria-label="Panel count">{panels.length}</output>;
}

describe("ChatFab", () => {
  it("keeps floating launchers hidden while a chat window is open", async () => {
    render(
      <ChatWindowManagerProvider storageId="chat-fab-hidden-test">
        <OpenPanelOnMount />
        <ChatFab />
      </ChatWindowManagerProvider>,
    );

    await act(async () => undefined);
    expect(screen.queryByTestId("chat-fab")).toBeNull();
  });

  it("keeps persistent launchers visible and focuses the existing window", async () => {
    render(
      <ChatWindowManagerProvider storageId="chat-fab-persistent-test">
        <OpenPanelOnMount />
        <ChatFab persistent />
        <PanelCount />
      </ChatWindowManagerProvider>,
    );

    const button = await screen.findByTestId("chat-fab");
    expect(button).not.toHaveAttribute("style");
    fireEvent.click(button);
    expect(screen.getByLabelText("Panel count")).toHaveTextContent("1");
  });

  it("uses the current-color AI sparkle icon by default", () => {
    render(
      <ChatWindowManagerProvider storageId="chat-fab-icon-test">
        <ChatFab />
      </ChatWindowManagerProvider>,
    );

    expect(screen.getByTestId("chat-fab").querySelector("path")).toHaveAttribute(
      "fill",
      "currentColor",
    );
  });
});

describe("ChatButton", () => {
  it("reuses ChatFab as persistent navbar chrome", () => {
    render(
      <ChatWindowManagerProvider storageId="chat-button-test">
        <ChatButton label="Open assistant" />
      </ChatWindowManagerProvider>,
    );

    const button = screen.getByRole("button", { name: "Open assistant" });
    expect(button).toHaveAttribute("data-testid", "chat-fab");
    expect(button.className).toContain("static");
    expect(button.className).toContain("bg-transparent");
    expect(button.className).not.toContain("fixed");
    expect(button.className).not.toContain("bg-primary");
  });
});
