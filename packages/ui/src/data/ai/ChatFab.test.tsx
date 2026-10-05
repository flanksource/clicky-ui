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

function PanelContextIds() {
  const { panels } = useChatWindowManager();
  return (
    <output aria-label="Panel context">
      {panels.map((p) => p.contextItems.map((c) => c.id).join(",")).join("|")}
    </output>
  );
}

describe("ChatFab context items", () => {
  const pageItem = { id: "entity:accounts:acct-1", type: "accounts", label: "Example account" };
  const otherItem = { id: "entity:journals:jnl-1", type: "journals", label: "Example journal" };

  it("opens a new window carrying the page's context items", () => {
    render(
      <ChatWindowManagerProvider storageId="chat-fab-context-open-test">
        <ChatFab contextItems={[pageItem]} />
        <PanelContextIds />
      </ChatWindowManagerProvider>,
    );

    fireEvent.click(screen.getByTestId("chat-fab"));
    expect(screen.getByLabelText("Panel context")).toHaveTextContent(pageItem.id);
  });

  it("adds the page's context items to an existing persistent window without duplicates", async () => {
    function OpenWithItem() {
      const { openPanel } = useChatWindowManager();
      useEffect(() => {
        openPanel({ contextItems: [otherItem] });
      }, [openPanel]);
      return null;
    }
    render(
      <ChatWindowManagerProvider storageId="chat-fab-context-reuse-test">
        <OpenWithItem />
        <ChatFab persistent contextItems={[pageItem]} />
        <PanelContextIds />
      </ChatWindowManagerProvider>,
    );

    const button = await screen.findByTestId("chat-fab");
    fireEvent.click(button);
    fireEvent.click(button);
    expect(screen.getByLabelText("Panel context")).toHaveTextContent(`${otherItem.id},${pageItem.id}`);
    expect(screen.getByLabelText("Panel context").textContent).toBe(`${otherItem.id},${pageItem.id}`);
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
