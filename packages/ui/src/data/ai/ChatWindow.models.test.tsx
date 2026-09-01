import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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
      JSON.stringify({
        runtime: {
          id: "claude-sonnet-5",
          model: "claude-sonnet-5",
          mode: "api",
        },
      }),
    );
    stubModels([
      model("unconfigured", "Unavailable Chat", false),
      model("fake-chat", "Fake Chat", true),
    ]);

    renderChatWindow("stale-model");

    await expectRuntimeModel("Fake Chat");
    await expectStoredRuntime("fake-chat");
  });

  it("preserves a stored model that exists and is configured", async () => {
    localStorage.setItem(
      CHAT_PREFERENCES_KEY,
      JSON.stringify({
        runtime: {
          id: "current-chat",
          model: "current-chat",
          mode: "api",
        },
      }),
    );
    stubModels([
      model("fake-chat", "Fake Chat", true),
      model("current-chat", "Current Chat", true),
    ]);

    renderChatWindow("configured-model");

    await expectRuntimeModel("Current Chat");
    await expectStoredRuntime("current-chat");
  });

  it("shows runtime catalog failures in Advanced settings and retries", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              family: "claude",
              provider: "anthropic",
              catalogPrefix: "anthropic",
              modes: [
                {
                  mode: "api",
                  kind: "api",
                  catalogProvider: "anthropic",
                  availability: { state: "available" },
                },
              ],
            },
          ]),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <ChatWindowManagerProvider storageId="catalog-retry">
        <OpenChatWindowOnMount>
          <ChatWindowLayer
            sessionsApi={null}
            toolsApi={null}
            runtimesApi="/api/chat/runtimes"
            chat={{
              models: [model("claude-sonnet", "Claude Sonnet", true)],
              transport: mockChatTransport(),
            }}
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
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Unable to load runtime availability (runtimes 503). Check Captain and retry.",
    );

    fireEvent.click(within(dialog).getByRole("button", { name: "Retry" }));
    await waitFor(() =>
      expect(within(dialog).queryByRole("alert")).not.toBeInTheDocument(),
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

// The runtime control mounts with the stored model and settles after the
// catalog fetch, so re-query and assert after that update.
// No runtimesApi is passed here, so the bar falls back to the offline catalog,
// where provider "anthropic" is the Claude family. The name it used to expect,
// "Anthropic", was a family that catalog has not carried for some time.
async function expectRuntimeModel(label: string): Promise<void> {
  await waitFor(() =>
    expect(
      screen.getByRole("button", {
        name: new RegExp(`^Runtime: Claude, API, ${label}, effort None$`),
      }),
    ).toBeInTheDocument(),
  );
}

async function expectStoredRuntime(modelId: string): Promise<void> {
  await waitFor(() =>
    expect(
      JSON.parse(localStorage.getItem(CHAT_PREFERENCES_KEY) ?? "{}").runtime,
    ).toMatchObject({
      id: modelId,
      model: modelId,
      mode: "api",
    }),
  );
}

function renderChatWindow(storageId: string): void {
  render(
    <ChatWindowManagerProvider storageId={storageId}>
      <OpenChatWindowOnMount>
        <ChatWindowLayer
          sessionsApi={null}
          toolsApi={null}
          chat={{ transport: mockChatTransport() }}
        />
      </OpenChatWindowOnMount>
    </ChatWindowManagerProvider>,
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
        }),
      ),
    ),
  );
}

function model(id: string, label: string, configured: boolean): ChatModel {
  return {
    id,
    label,
    configured,
    provider: "anthropic",
    reasoning: false,
    capabilitiesKnown: true,
    runtime: { id, model: id, mode: "api" },
  };
}
