import { act, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionTail } from "./SessionTail";
import type { SessionUIMessage } from "./SessionViewer.unified";
import {
  jsonResponse,
  lastEventSource,
  remoteSession,
  renderWithFakeStream,
  resetFakeEventSources,
  stubSessionFetch,
  textMessage,
} from "../../test/fake-session-stream.test-utils";

const SRC = "/api/captain/sessions/tail";
const TAIL = `${SRC}?tail=20`;

const toolMessage = (
  id: string,
  toolName: string,
  input: Record<string, unknown>,
): SessionUIMessage => ({
  id,
  role: "assistant",
  parts: [{ type: "dynamic-tool", toolName, toolCallId: `${id}-call`, input }],
  provenance: { sessionId: "tail", cwd: "/work/repo" },
});

const thinkingMessage = (id: string, text: string): SessionUIMessage => ({
  id,
  role: "assistant",
  parts: [{ type: "reasoning", text }],
});

const stubMessages = (
  messages: SessionUIMessage[],
  lifecycleStatus = "running",
) => stubSessionFetch({ [TAIL]: [() => jsonResponse(remoteSession({ messages, lifecycleStatus }))] });

beforeEach(resetFakeEventSources);
afterEach(() => vi.unstubAllGlobals());

describe("SessionTail latest entry", () => {
  it("shows the tool call when it comes after the last assistant text", async () => {
    stubMessages([
      textMessage("m1", "Looking at the router"),
      toolMessage("m2", "Read", { file_path: "/work/repo/src/router.ts" }),
    ]);

    renderWithFakeStream(<SessionTail src={SRC} />);

    const tool = await screen.findByTestId("session-tail-tool");
    expect(tool).toHaveTextContent("Read");
    expect(tool).toHaveTextContent("src/router.ts");
    expect(screen.queryByText("Looking at the router")).not.toBeInTheDocument();
  });

  it("shows the assistant text when it comes after the last tool call", async () => {
    stubMessages([
      toolMessage("m1", "Bash", { command: "go test ./..." }),
      textMessage("m2", "All tests pass"),
    ]);

    renderWithFakeStream(<SessionTail src={SRC} />);

    expect(await screen.findByText("All tests pass")).toBeInTheDocument();
    expect(screen.queryByTestId("session-tail-tool")).not.toBeInTheDocument();
  });

  it("ignores reasoning that follows the latest entry", async () => {
    stubMessages([
      textMessage("m1", "Plan is ready"),
      thinkingMessage("m2", "private chain of thought"),
    ]);

    renderWithFakeStream(<SessionTail src={SRC} />);

    expect(await screen.findByText("Plan is ready")).toBeInTheDocument();
    expect(screen.queryByText("private chain of thought")).not.toBeInTheDocument();
  });

  it("replaces the shown entry when a streamed entry arrives", async () => {
    stubMessages([textMessage("m1", "Starting")]);

    renderWithFakeStream(<SessionTail src={SRC} />);
    await screen.findByText("Starting");

    act(() => {
      lastEventSource().emit("entry", toolMessage("m2", "Grep", { pattern: "TODO", path: "src" }));
    });

    const tool = await screen.findByTestId("session-tail-tool");
    expect(tool).toHaveTextContent("Grep");
    expect(tool).toHaveTextContent("TODO src");
    expect(screen.queryByText("Starting")).not.toBeInTheDocument();
  });
});

describe("SessionTail text clamping", () => {
  it("clamps assistant text to one line and keeps the full text in the title", async () => {
    const full = "First line of the answer\nsecond line that must not wrap the tail";
    stubMessages([textMessage("m1", full)]);

    renderWithFakeStream(<SessionTail src={SRC} />);

    const text = await screen.findByTestId("session-tail-text");
    expect(text).toHaveAttribute("title", full);
    expect(text).toHaveClass("truncate");
  });

  it("keeps the full tool summary in the title", async () => {
    const command = "pnpm vitest run packages/ui/src/data/ai/SessionTail.test.tsx --reporter=verbose";
    stubMessages([toolMessage("m1", "Bash", { command })]);

    renderWithFakeStream(<SessionTail src={SRC} />);

    const tool = await screen.findByTestId("session-tail-tool");
    expect(tool).toHaveAttribute("title", `Bash ${command}`);
  });
});

describe("SessionTail empty state", () => {
  it("shows emptyLabel while loading, then while the session has no entries", async () => {
    stubMessages([]);

    renderWithFakeStream(<SessionTail src={SRC} emptyLabel="Waiting for agent" />);

    expect(screen.getByText("Waiting for agent")).toBeInTheDocument();
    await waitFor(() => expect(lastEventSource().url).toBe(`${SRC}?follow=1`));
    expect(screen.getByText("Waiting for agent")).toBeInTheDocument();
  });

  it("renders no tool or text node when there is no emptyLabel", async () => {
    stubMessages([]);

    renderWithFakeStream(<SessionTail src={SRC} />);

    await waitFor(() => expect(lastEventSource().url).toBe(`${SRC}?follow=1`));
    expect(screen.queryByTestId("session-tail-tool")).not.toBeInTheDocument();
    expect(screen.queryByTestId("session-tail-text")).not.toBeInTheDocument();
  });

  it("surfaces a load failure instead of the empty label", async () => {
    stubSessionFetch({ [TAIL]: [() => jsonResponse({ error: "no such session" }, 404)] });

    renderWithFakeStream(<SessionTail src={SRC} emptyLabel="Waiting for agent" />);

    expect(await screen.findByRole("alert")).toHaveTextContent("no such session");
    expect(screen.queryByText("Waiting for agent")).not.toBeInTheDocument();
  });
});

describe("SessionTail follow", () => {
  it("shows the running spinner while following", async () => {
    stubMessages([textMessage("m1", "Working")]);

    renderWithFakeStream(<SessionTail src={SRC} />);

    await screen.findByText("Working");
    expect(screen.getByRole("status", { name: "Following session" })).toBeInTheDocument();
  });

  it("shows no spinner and opens no stream when follow is false", async () => {
    stubMessages([textMessage("m1", "Done")], "succeeded");

    renderWithFakeStream(<SessionTail src={SRC} follow={false} />);

    await screen.findByText("Done");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(() => lastEventSource()).toThrow("no EventSource was opened");
  });

  it("drops the spinner once the session reports a terminal lifecycle", async () => {
    const messages = [textMessage("m1", "Working")];
    stubSessionFetch({
      [TAIL]: [
        () => jsonResponse(remoteSession({ messages })),
        () => jsonResponse(remoteSession({ messages, lifecycleStatus: "succeeded", revision: 2 })),
      ],
    });

    renderWithFakeStream(<SessionTail src={SRC} />);
    await screen.findByRole("status");

    act(() => {
      lastEventSource().emit("state", {
        revision: 2,
        lifecycleStatus: "succeeded",
        activityState: "idle",
        facets: "",
      });
    });

    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
  });
});
