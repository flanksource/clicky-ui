import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionInspector } from "./SessionInspector";
import {
  FakeEventSource,
  jsonResponse,
  lastEventSource,
  remoteSession,
  renderWithFakeStream,
  resetFakeEventSources,
  stubSessionFetch,
  textMessage,
} from "../../test/fake-session-stream.test-utils";

const SRC = "/api/captain/sessions/remote";
// The first read asks for the tail; see SessionInspector.remote.
const TAIL = `${SRC}?tail=100`;
beforeEach(resetFakeEventSources);
afterEach(() => vi.unstubAllGlobals());

describe("SessionInspector transcript availability", () => {
  it("surfaces a real unknown-session response as an error", async () => {
    stubSessionFetch({
      [TAIL]: [() => jsonResponse({ error: "session remote not found" }, 404)],
    });
    renderWithFakeStream(<SessionInspector src={SRC} follow={false} />);
    expect((await screen.findByRole("alert")).textContent).toContain(
      "HTTP 404"
    );
    expect(screen.queryByText("Transcript unavailable")).toBeNull();
  });

  it("renders an available transcript normally", async () => {
    stubSessionFetch({
      [TAIL]: [
        () =>
          jsonResponse(
            remoteSession({
              detailAvailable: true,
              messages: [textMessage("existing", "Existing transcript")],
            })
          ),
      ],
    });
    renderWithFakeStream(<SessionInspector src={SRC} follow={false} />);
    expect(await screen.findByText("Existing transcript")).toBeTruthy();
    expect(screen.queryByText("Transcript unavailable")).toBeNull();
  });

  it("shows a neutral unavailable state for metadata-only sessions without following", async () => {
    stubSessionFetch({
      [TAIL]: [
        () =>
          jsonResponse(
            remoteSession({
              detailAvailable: false,
              lifecycleStatus: "created",
              cwd: "/work/example",
            })
          ),
      ],
    });
    renderWithFakeStream(<SessionInspector src={SRC} follow={false} />);

    expect(await screen.findByText("Transcript unavailable")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(FakeEventSource.instances).toHaveLength(0);
    fireEvent.click(screen.getByRole("tab", { name: /^Metadata/ }));
    expect(await screen.findByText("/work/example")).toBeTruthy();
  });

  it("displays messages arriving after an unavailable snapshot", async () => {
    stubSessionFetch({
      [TAIL]: [() => jsonResponse(remoteSession({ detailAvailable: false }))],
    });
    renderWithFakeStream(<SessionInspector src={SRC} follow />);
    await screen.findByText("Transcript unavailable");

    act(() =>
      lastEventSource().emit(
        "entry",
        textMessage("new-message", "A transcript is now available")
      )
    );

    expect(
      await screen.findByText("A transcript is now available")
    ).toBeTruthy();
    expect(screen.queryByText("Transcript unavailable")).toBeNull();
  });

  it("retains the empty-activity state when availability is not specified", async () => {
    stubSessionFetch({ [TAIL]: [() => jsonResponse(remoteSession())] });
    renderWithFakeStream(<SessionInspector src={SRC} follow={false} />);
    expect(await screen.findByText("No session activity.")).toBeTruthy();
  });
});
