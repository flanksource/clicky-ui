import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ComponentProps } from "react";
import { SessionHeader } from "./SessionHeader";
import type { RenderLink } from "./EndpointList";
import {
  JVM_TRACE_EVENTS,
  KV_STORE_EVENTS,
  STOPPED_JVM_TRACE_SESSION,
  runningSessionFixture,
  sessionFixture,
} from "./session-story.fixtures";

const NOW = Date.parse("2026-09-15T10:04:00Z");
const MINUTE = 60_000;

const renderTestLink: RenderLink = ({ to, children, className, title, key }) => (
  <a key={key} href={to} className={className} title={title} data-testid="session-link">
    {children}
  </a>
);

function renderHeader(overrides: Partial<ComponentProps<typeof SessionHeader>> = {}) {
  const callbacks = { onStop: vi.fn(), onExtend: vi.fn(), onRestart: vi.fn() };
  const view = render(
    <SessionHeader
      session={STOPPED_JVM_TRACE_SESSION}
      getSessionHref={(id) => `/traces/sessions/${id}`}
      {...callbacks}
      {...overrides}
    />,
  );
  return { ...view, ...callbacks };
}

const button = (name: string) => screen.queryByRole("button", { name });

afterEach(() => {
  vi.useRealTimers();
});

describe("SessionHeader control gating", () => {
  it.each([
    {
      name: "a controllable running session offers Stop and Extend",
      session: runningSessionFixture("2026-09-15T10:15:00Z"),
      visible: ["Stop", "Extend"],
      hidden: ["Restart"],
    },
    {
      name: "a running session another process owns offers nothing",
      session: runningSessionFixture("2026-09-15T10:15:00Z", { controllable: false }),
      visible: [],
      hidden: ["Stop", "Extend", "Restart"],
    },
    {
      name: "an ended restartable session offers only Restart",
      session: sessionFixture({ restartable: true }),
      visible: ["Restart"],
      hidden: ["Stop", "Extend"],
    },
    {
      name: "an ended session the API refuses to restart offers nothing",
      session: sessionFixture({ restartable: false }),
      visible: [],
      hidden: ["Stop", "Extend", "Restart"],
    },
    {
      name: "an interrupted session no registry holds is still restartable when the API says so",
      session: sessionFixture({ state: "interrupted", controllable: false, restartable: true }),
      visible: ["Restart"],
      hidden: ["Stop", "Extend"],
    },
  ])("$name", ({ session, visible, hidden }) => {
    vi.useFakeTimers({ now: NOW });
    renderHeader({ session });
    for (const name of visible) expect(button(name)).toBeInTheDocument();
    for (const name of hidden) expect(button(name)).toBeNull();
  });

  it("disables Stop while the session is already stopping", () => {
    vi.useFakeTimers({ now: NOW });
    renderHeader({ session: runningSessionFixture("2026-09-15T10:15:00Z", { state: "stopping" }) });
    expect(button("Stop")).toBeDisabled();
    expect(button("Extend")).toBeDisabled();
  });

  it("names the owning process when it cannot control an active session", () => {
    vi.useFakeTimers({ now: NOW });
    renderHeader({
      session: runningSessionFixture("2026-09-15T10:15:00Z", { controllable: false }),
    });
    expect(screen.getByText(/controlled by mission-control-oipa-6d9f \(pid 1\)/i)).toBeInTheDocument();
  });
});

describe("SessionHeader stopAt countdown", () => {
  it("counts down to the deadline once a second", () => {
    vi.useFakeTimers({ now: NOW });
    renderHeader({ session: runningSessionFixture("2026-09-15T10:09:12Z") });
    expect(screen.getByText("Stops in 5m 12s")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2_000);
    });
    expect(screen.getByText("Stops in 5m 10s")).toBeInTheDocument();
  });

  it("says the deadline passed rather than counting below zero", () => {
    vi.useFakeTimers({ now: NOW });
    renderHeader({ session: runningSessionFixture("2026-09-15T10:03:30Z") });
    expect(screen.getByText("Deadline passed 30s ago")).toBeInTheDocument();
  });

  it("shows no countdown once the session has ended", () => {
    vi.useFakeTimers({ now: NOW });
    renderHeader();
    expect(screen.queryByText(/^Stops in/)).toBeNull();
    expect(screen.getByText("stopped by admin")).toBeInTheDocument();
  });
});

describe("SessionHeader durations", () => {
  it("restarts with the run's own duration without prompting", () => {
    const { onRestart } = renderHeader();
    fireEvent.click(button("Restart")!);
    expect(onRestart).toHaveBeenCalledWith({ durationMs: 15 * MINUTE });
    expect(screen.queryByRole("group", { name: "Restart duration" })).toBeNull();
  });

  it.each([
    { name: "0", params: { ...STOPPED_JVM_TRACE_SESSION.params, durationMs: 0 } },
    { name: "missing", params: { target: "cycle" } },
  ])("prompts for a restart duration when params.durationMs is $name", ({ params }) => {
    const { onRestart } = renderHeader({ session: sessionFixture({ params }) });
    fireEvent.click(button("Restart")!);
    expect(onRestart).not.toHaveBeenCalled();

    const prompt = screen.getByRole("group", { name: "Restart duration" });
    fireEvent.click(within(prompt).getByRole("button", { name: "1h" }));
    expect(onRestart).toHaveBeenCalledWith({ durationMs: 60 * MINUTE });
  });

  it("extends by the duration picked in the prompt", () => {
    vi.useFakeTimers({ now: NOW });
    const { onExtend } = renderHeader({ session: runningSessionFixture("2026-09-15T10:15:00Z") });
    fireEvent.click(button("Extend")!);
    const prompt = screen.getByRole("group", { name: "Extend duration" });
    fireEvent.click(within(prompt).getByRole("button", { name: "5m" }));
    expect(onExtend).toHaveBeenCalledWith(5 * MINUTE);
  });

  it("cancelling the prompt calls nothing", () => {
    vi.useFakeTimers({ now: NOW });
    const { onExtend } = renderHeader({ session: runningSessionFixture("2026-09-15T10:15:00Z") });
    fireEvent.click(button("Extend")!);
    fireEvent.click(button("Cancel")!);
    expect(screen.queryByRole("group", { name: "Extend duration" })).toBeNull();
    expect(onExtend).not.toHaveBeenCalled();
  });
});

describe("SessionHeader confirm slot", () => {
  it("holds a mutating kind's Stop until the host's confirm slot confirms it", () => {
    vi.useFakeTimers({ now: NOW });
    const { onStop } = renderHeader({
      session: runningSessionFixture("2026-09-15T10:15:00Z"),
      mutating: true,
      renderConfirm: ({ action, confirm, cancel }) => (
        <div role="alertdialog" aria-label={`confirm ${action}`}>
          <button onClick={confirm}>Yes</button>
          <button onClick={cancel}>No</button>
        </div>
      ),
    });
    fireEvent.click(button("Stop")!);
    expect(onStop).not.toHaveBeenCalled();

    fireEvent.click(within(screen.getByRole("alertdialog", { name: "confirm stop" })).getByText("Yes"));
    expect(onStop).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("passes the chosen duration to the confirm slot and restarts only after confirming", () => {
    const confirmed = vi.fn();
    const { onRestart } = renderHeader({
      mutating: true,
      renderConfirm: ({ durationMs, confirm }) => (
        <button
          onClick={() => {
            confirmed(durationMs);
            confirm();
          }}
        >
          Confirm restart
        </button>
      ),
    });
    fireEvent.click(button("Restart")!);
    expect(onRestart).not.toHaveBeenCalled();
    fireEvent.click(button("Confirm restart")!);
    expect(confirmed).toHaveBeenCalledWith(15 * MINUTE);
    expect(onRestart).toHaveBeenCalledWith({ durationMs: 15 * MINUTE });
  });

  it("does not ask a non-mutating kind to confirm", () => {
    vi.useFakeTimers({ now: NOW });
    const renderConfirm = vi.fn();
    const { onStop } = renderHeader({
      session: runningSessionFixture("2026-09-15T10:15:00Z"),
      renderConfirm,
    });
    fireEvent.click(button("Stop")!);
    expect(onStop).toHaveBeenCalledTimes(1);
    expect(renderConfirm).not.toHaveBeenCalled();
  });
});

describe("SessionHeader identity", () => {
  it.each(["oipa_notification_v2", "oipa_notification_v3"])("shows recorded event kind %s in the header", (kind) => {
    renderHeader({ session: sessionFixture({ events: { ...JVM_TRACE_EVENTS, kind } }) });
    expect(screen.getByText(`Event kind: ${kind}`)).toBeInTheDocument();
  });

  it("links restart lineage both ways through getSessionHref and renderLink", () => {
    renderHeader({
      session: sessionFixture({ restartOf: "prev-1111", restartedAs: ["next-2222", "next-3333"] }),
      renderLink: renderTestLink,
    });
    const hrefs = screen.getAllByTestId("session-link").map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual([
      "/traces/sessions/prev-1111",
      "/traces/sessions/next-2222",
      "/traces/sessions/next-3333",
    ]);
  });

  it("shows state, unresponsive, owner, labels, warning and error", () => {
    vi.useFakeTimers({ now: NOW });
    renderHeader({
      session: runningSessionFixture("2026-09-15T10:15:00Z", {
        unresponsive: true,
        warning: "status write failed: redis timeout",
        error: "probe detached",
      }),
    });
    expect(screen.getByText("running")).toBeInTheDocument();
    expect(screen.getByText("unresponsive")).toBeInTheDocument();
    expect(screen.getByText("mission-control-oipa-6d9f · pid 1")).toBeInTheDocument();
    expect(screen.getByText("origin=web")).toBeInTheDocument();
    expect(screen.getByText("target=cycle")).toBeInTheDocument();
    expect(screen.getByText("status write failed: redis timeout")).toBeInTheDocument();
    expect(screen.getByText("probe detached")).toBeInTheDocument();
  });

  it("renders the labels as a named list so assistive tech announces them", () => {
    renderHeader();
    const list = screen.getByRole("list", { name: "Labels" });
    expect(within(list).getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "target=cycle",
      "origin=web",
      "via=http",
      "environment=oipa.lab",
    ]);
  });
});

describe("SessionHeader unavailable events", () => {
  const FILE = JVM_TRACE_EVENTS.store.file;
  const HOST = JVM_TRACE_EVENTS.store.host;

  it.each([
    {
      name: "file and host",
      store: { backend: "sqlite", host: HOST, file: FILE },
      text: `Events were in ${FILE} on ${HOST}; this server cannot read that store.`,
    },
    {
      name: "host only",
      store: { backend: "postgres", host: HOST },
      text: `Events were on ${HOST}; this server cannot read that store.`,
    },
    {
      name: "file only",
      store: { backend: "sqlite", file: FILE },
      text: `Events were in ${FILE}; this server cannot read that store.`,
    },
    {
      name: "neither (a kv store)",
      store: KV_STORE_EVENTS.store,
      text: "Events were on the kv store; this server cannot read that store.",
    },
  ])("names only the location parts the server sent: $name", ({ store, text }) => {
    renderHeader({
      session: sessionFixture({ eventsAvailable: false, events: { ...JVM_TRACE_EVENTS, store } }),
    });
    expect(screen.getByText(text)).toBeInTheDocument();
  });
});

describe("SessionHeader action errors", () => {
  it("shows the last action's failure beside the header", () => {
    vi.useFakeTimers({ now: NOW });
    renderHeader({
      session: runningSessionFixture("2026-09-15T10:15:00Z"),
      actionError: new Error("POST /api/v1/sessions/7c1e/stop failed: forbidden"),
    });
    expect(screen.getByText("POST /api/v1/sessions/7c1e/stop failed: forbidden")).toBeInTheDocument();
  });

  it("shows no action failure when there is none", () => {
    vi.useFakeTimers({ now: NOW });
    renderHeader({ session: runningSessionFixture("2026-09-15T10:15:00Z"), actionError: undefined });
    expect(screen.queryByText(/Action failed/i)).toBeNull();
  });
});

describe("SessionHeader stale prompts", () => {
  it("closes an open Extend prompt once the session turns terminal", () => {
    vi.useFakeTimers({ now: NOW });
    const running = runningSessionFixture("2026-09-15T10:15:00Z");
    const { rerender, onExtend, onRestart, onStop } = renderHeader({ session: running });
    fireEvent.click(button("Extend")!);
    expect(screen.getByRole("group", { name: "Extend duration" })).toBeInTheDocument();

    const stopped = sessionFixture({ restartable: true });
    rerender(
      <SessionHeader
        session={stopped}
        getSessionHref={(id) => `/traces/sessions/${id}`}
        onStop={onStop}
        onExtend={onExtend}
        onRestart={onRestart}
      />,
    );
    expect(screen.queryByRole("group", { name: "Extend duration" })).toBeNull();
    expect(button("Restart")).toBeInTheDocument();
  });

  it("drops a pending Stop confirmation once the session is already stopping", () => {
    vi.useFakeTimers({ now: NOW });
    const renderConfirm = ({ action }: { action: string }) => <div role="alertdialog" aria-label={`confirm ${action}`} />;
    const running = runningSessionFixture("2026-09-15T10:15:00Z");
    const { rerender, onExtend, onRestart, onStop } = renderHeader({ session: running, mutating: true, renderConfirm });
    fireEvent.click(button("Stop")!);
    expect(screen.getByRole("alertdialog", { name: "confirm stop" })).toBeInTheDocument();

    rerender(
      <SessionHeader
        session={{ ...running, state: "stopping" }}
        getSessionHref={(id) => `/traces/sessions/${id}`}
        onStop={onStop}
        onExtend={onExtend}
        onRestart={onRestart}
        mutating
        renderConfirm={renderConfirm}
      />,
    );
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });
});
