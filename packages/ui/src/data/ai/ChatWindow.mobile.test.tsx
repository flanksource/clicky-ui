import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ChatWindowManagerProvider } from "./ChatWindowManager";
import { ChatWindowLayer, CHAT_WINDOW_MOBILE_QUERY } from "./ChatWindow";
import { ChatFab } from "./ChatFab";
import { useChatWindowManager } from "./chat-window-context";
import { mockChatTransport } from "../chat/Chat.fixtures";
import {
  OpenChatWindowOnMount,
  installMemoryStorage,
} from "./ChatWindow.test-utils";

const originalMatchMedia = window.matchMedia;

function setViewport(kind: "mobile" | "desktop") {
  window.matchMedia = ((query: string) =>
    ({
      matches: kind === "mobile" && query === CHAT_WINDOW_MOBILE_QUERY,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList) as typeof window.matchMedia;
}

const layerProps = {
  sessionsApi: null,
  toolsApi: null,
  chat: { modelsApi: null, transport: mockChatTransport() },
} as const;

function OpenTwo() {
  const { openPanel } = useChatWindowManager();
  useEffect(() => {
    openPanel();
    openPanel();
  }, [openPanel]);
  return null;
}

beforeEach(() => installMemoryStorage());

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.matchMedia = originalMatchMedia;
});

describe("ChatWindowLayer on a small viewport", () => {
  it("exports the small-screen query hosts can match", () => {
    expect(CHAT_WINDOW_MOBILE_QUERY).toBe("(max-width: 767px)");
  });

  it("renders a full-screen sheet with safe-area insets and no drag or resize handles", async () => {
    setViewport("mobile");
    render(
      <ChatWindowManagerProvider storageId="mobile-sheet">
        <OpenChatWindowOnMount>
          <ChatWindowLayer {...layerProps} />
        </OpenChatWindowOnMount>
      </ChatWindowManagerProvider>,
    );

    const sheet = await screen.findByTestId("chat-window-sheet");
    expect(sheet).toHaveClass("fixed", "inset-x-0", "top-0", "flex-col");
    expect(sheet.className).toContain("env(safe-area-inset-top)");
    expect(sheet.className).toContain("env(safe-area-inset-left)");
    expect(sheet.className).toContain("env(safe-area-inset-right)");
    // Let the lazy react-rnd import settle: a sheet must never pick it up.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    expect(document.querySelector(".react-draggable")).toBeNull();
    expect(document.querySelector(".chat-drag-handle")).toBeNull();
    expect(screen.queryByRole("button", { name: /maximize|restore/i })).toBeNull();
  });

  it("sizes the sheet to the dynamic viewport and clips it so the document cannot scroll", async () => {
    setViewport("mobile");
    renderOpenWindow("mobile-dvh");

    const sheet = await screen.findByTestId("chat-window-sheet");
    expect(sheet).toHaveClass("h-dvh", "overflow-hidden");
    expect(sheet).not.toHaveClass("inset-0", "inset-y-0", "bottom-0");
  });

  it("pins the prompt below the one scrolling message log, padded by the bottom safe area", async () => {
    setViewport("mobile");
    renderOpenWindow("mobile-pinned-input");

    expectPromptPinned(await screen.findByTestId("chat-window-sheet"));
  });

  it("closes the window from the back button in the header", async () => {
    setViewport("mobile");
    render(
      <ChatWindowManagerProvider storageId="mobile-close">
        <OpenChatWindowOnMount>
          <ChatWindowLayer {...layerProps} />
        </OpenChatWindowOnMount>
      </ChatWindowManagerProvider>,
    );

    await screen.findByTestId("chat-window-sheet");
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    await waitFor(() => expect(screen.queryByTestId("chat-window-sheet")).toBeNull());
  });

  it("shows only the most recently focused window and keeps the others mounted", async () => {
    setViewport("mobile");
    render(
      <ChatWindowManagerProvider storageId="mobile-one-visible">
        <OpenTwo />
        <ChatWindowLayer {...layerProps} />
      </ChatWindowManagerProvider>,
    );

    await waitFor(() =>
      expect(screen.getAllByTestId("chat-window-sheet")).toHaveLength(2),
    );
    const isHidden = (sheet: HTMLElement) => sheet.closest("[hidden]") !== null;
    const [first, second] = screen.getAllByTestId("chat-window-sheet");
    expect([isHidden(first!), isHidden(second!)]).toEqual([true, false]);

    fireEvent.click(within(second!).getByRole("button", { name: "Back" }));
    await waitFor(() =>
      expect(screen.getAllByTestId("chat-window-sheet")).toHaveLength(1),
    );
    expect(isHidden(screen.getByTestId("chat-window-sheet"))).toBe(false);
  });

  it("lifts the launcher above the bottom safe area", () => {
    setViewport("mobile");
    render(
      <ChatWindowManagerProvider storageId="mobile-fab">
        <ChatFab />
      </ChatWindowManagerProvider>,
    );

    expect(screen.getByTestId("chat-fab").className).toContain(
      "bottom-[calc(1rem+env(safe-area-inset-bottom))]",
    );
  });
});

function renderOpenWindow(storageId: string) {
  render(
    <ChatWindowManagerProvider storageId={storageId}>
      <OpenChatWindowOnMount>
        <ChatWindowLayer {...layerProps} />
      </OpenChatWindowOnMount>
    </ChatWindowManagerProvider>,
  );
}

const SCROLL_CLASS = /(^|\s)overflow-(y-)?(auto|scroll)(\s|$)/;

/** The prompt bar is a shrink-0 sibling of the message log inside one clipped
 *  flex column, so only the log scrolls and the input stays on the bottom edge. */
function expectPromptPinned(container: HTMLElement) {
  const log = within(container).getByRole("log");
  const textbox = within(container).getByRole("textbox");
  expect(log).toHaveClass("overflow-y-auto");
  expect(log.contains(textbox)).toBe(false);
  const promptBar = textbox.closest("form")!.parentElement as HTMLElement;
  expect(promptBar).toHaveClass("shrink-0");
  expect(promptBar.className).toContain("env(safe-area-inset-bottom)");
  const chat = promptBar.parentElement as HTMLElement;
  expect(chat).toHaveClass("flex", "h-full", "flex-col");
  expect(promptBar).toBe(chat.lastElementChild);
  for (let el = chat.parentElement; el && el !== container; el = el.parentElement) {
    expect(el.className).not.toMatch(SCROLL_CLASS);
  }
}

describe("ChatWindowLayer on a desktop viewport", () => {
  it("pins the prompt below the one scrolling message log in the floating window", async () => {
    setViewport("desktop");
    renderOpenWindow("desktop-pinned-input");

    await waitFor(() =>
      expect(document.querySelector(".react-draggable")).not.toBeNull(),
    );
    expectPromptPinned(
      document.querySelector(".react-draggable") as HTMLElement,
    );
  });

  it("keeps the draggable react-rnd window with its maximize toggle", async () => {
    setViewport("desktop");
    render(
      <ChatWindowManagerProvider storageId="desktop-rnd">
        <OpenChatWindowOnMount>
          <ChatWindowLayer {...layerProps} />
        </OpenChatWindowOnMount>
      </ChatWindowManagerProvider>,
    );

    await waitFor(() =>
      expect(document.querySelector(".react-draggable")).not.toBeNull(),
    );
    expect(screen.queryByTestId("chat-window-sheet")).toBeNull();
    expect(document.querySelector(".chat-drag-handle")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Maximize" })).toBeInTheDocument();
  });
});
