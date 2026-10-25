import { act, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionInspector } from "./SessionInspector";
import type { SessionInspectorLoadState } from "./SessionInspector.remote";
import {
  FakeEventSource,
  jsonResponse,
  lastEventSource,
  remoteSession,
  renderWithFakeStream,
  resetFakeEventSources,
  stubSessionFetch,
} from "../../test/fake-session-stream.test-utils";

const SRC = "/api/captain/sessions/remote";
// The first read asks for the tail; see SessionInspector.remote.
const TAIL = `${SRC}?tail=100`;

beforeEach(resetFakeEventSources);
afterEach(() => vi.unstubAllGlobals());

describe("SessionInspector onLoadStateChange", () => {
  it("reports loading, then ready after a successful fetch", async () => {
    stubSessionFetch({ [TAIL]: [() => jsonResponse(remoteSession())] });
    const onLoadStateChange = vi.fn<(state: SessionInspectorLoadState) => void>();

    renderWithFakeStream(
      <SessionInspector src={SRC} onLoadStateChange={onLoadStateChange} />,
    );

    await waitFor(() =>
      expect(onLoadStateChange).toHaveBeenLastCalledWith({ status: "ready" }),
    );
    expect(onLoadStateChange.mock.calls.map(([state]) => state)).toEqual([
      { status: "loading" },
      { status: "ready" },
    ]);
  });

  it.each([
    {
      name: "a JSON error body",
      response: () =>
        jsonResponse({ error: "session remote not found", detailSource: "none" }, 404),
      message: "session remote not found",
    },
    {
      name: "a plain-text body",
      response: () => new Response("no route for session remote", { status: 404 }),
      message: "no route for session remote",
    },
  ])("reports an error carrying the server message for $name of a 404", async ({ response, message }) => {
    stubSessionFetch({ [TAIL]: [response] });
    const onLoadStateChange = vi.fn<(state: SessionInspectorLoadState) => void>();

    renderWithFakeStream(
      <SessionInspector src={SRC} onLoadStateChange={onLoadStateChange} />,
    );

    await screen.findByRole("alert");
    // The state is reported from a passive effect, which can run after the
    // alert is already in the DOM.
    await waitFor(() => expect(onLoadStateChange.mock.lastCall?.[0].status).toBe("error"));
    const last = onLoadStateChange.mock.lastCall![0];
    expect(last.error).toBeInstanceOf(Error);
    expect(last.error!.message).toContain(message);
    expect(last.error!.message).toContain("HTTP 404");
    expect(onLoadStateChange.mock.calls[0]![0]).toEqual({ status: "loading" });
  });

  it("reports an error when the follow stream sends a terminal error frame", async () => {
    stubSessionFetch({ [TAIL]: [() => jsonResponse(remoteSession())] });
    const onLoadStateChange = vi.fn<(state: SessionInspectorLoadState) => void>();

    renderWithFakeStream(
      <SessionInspector src={SRC} onLoadStateChange={onLoadStateChange} />,
    );
    await waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    await waitFor(() =>
      expect(onLoadStateChange).toHaveBeenLastCalledWith({ status: "ready" }),
    );

    act(() =>
      lastEventSource().emit("error", {
        error: "LISTEN captain_session_change failed",
      }),
    );

    const last = onLoadStateChange.mock.lastCall![0];
    expect(last.status).toBe("error");
    expect(last.error!.message).toContain("LISTEN captain_session_change failed");
  });
});
