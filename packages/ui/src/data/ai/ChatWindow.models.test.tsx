import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatModel } from "../chat/types";
import { mockChatTransport } from "../chat/Chat.fixtures";
import { ChatWindowLayer } from "./ChatWindow";
import {
  installMemoryStorage,
  OpenChatWindowOnMount,
} from "./ChatWindow.test-utils";
import { ChatWindowManagerProvider } from "./ChatWindowManager";

const CHAT_PREFERENCES_KEY = "clicky-ui.chat-window.preferences";

beforeEach(() => installMemoryStorage());

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("ChatWindow model fetching", () => {
  it("replaces a stored unavailable model with the first configured fetched model", async () => {
    localStorage.setItem(
      CHAT_PREFERENCES_KEY,
      JSON.stringify({ model: "claude-sonnet-5" })
    );
    stubModels([
      model("unconfigured", "Unavailable Chat", false),
      model("fake-chat", "Fake Chat", true),
    ]);

    renderChatWindow("stale-model");

    await expectModelValue("Fake Chat");
  });

  it("preserves a stored model that exists and is configured", async () => {
    localStorage.setItem(
      CHAT_PREFERENCES_KEY,
      JSON.stringify({ model: "current-chat" })
    );
    stubModels([
      model("fake-chat", "Fake Chat", true),
      model("current-chat", "Current Chat", true),
    ]);

    renderChatWindow("configured-model");

    await expectModelValue("Current Chat");
  });
});

// The picker mounts with the stored model and only settles once the catalog
// fetch resolves, so re-query and assert together instead of holding on to the
// combobox found before that update.
async function expectModelValue(label: string): Promise<void> {
  await waitFor(() =>
    expect(screen.getByRole("combobox", { name: "Model" })).toHaveValue(label),
  );
}

function renderChatWindow(storageId: string): void {
  render(
    <ChatWindowManagerProvider storageId={storageId}>
      <OpenChatWindowOnMount>
        <ChatWindowLayer
          threadsApi={null}
          toolsApi={null}
          chat={{ transport: mockChatTransport() }}
        />
      </OpenChatWindowOnMount>
    </ChatWindowManagerProvider>
  );
}

function stubModels(models: ChatModel[]): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify(models), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    )
  );
}

function model(id: string, label: string, configured: boolean): ChatModel {
  return { id, label, configured, provider: "fake", reasoning: false };
}
