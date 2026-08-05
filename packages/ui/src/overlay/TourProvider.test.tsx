import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TourProvider } from "./TourProvider";
import { useTour } from "./tour-context";
import { memoryTourStorage, type TourCompletion } from "./tour-progress";
import type { TourDefinition } from "./tour-types";

const TOURS: TourDefinition[] = [
  {
    id: "first-hour",
    title: "First hour",
    steps: [
      { id: "one", title: "Stop one", target: '[data-tour="one"]' },
      { id: "two", title: "Stop two", target: '[data-tour="two"]' },
    ],
  },
];

function completion(overrides: Partial<TourCompletion> = {}): TourCompletion {
  return {
    tourId: "first-hour",
    status: "completed",
    version: 1,
    at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function Controls() {
  const tour = useTour();
  return (
    <div>
      <button onClick={() => tour.start("first-hour")}>start</button>
      <button onClick={() => tour.start("first-hour", { force: true })}>start forced</button>
      <button onClick={() => tour.start("first-hour", { at: "two" })}>start at two</button>
      <button onClick={() => tour.next()}>next</button>
      <button onClick={() => tour.finish("completed")}>finish</button>
      <button onClick={() => tour.reset()}>reset</button>
      <span data-testid="state">{`${tour.tourId ?? "none"}:${tour.index}:${tour.total}`}</span>
      <span data-testid="finished">{String(tour.isFinished("first-hour"))}</span>
    </div>
  );
}

function renderProvider(options: {
  tours?: TourDefinition[];
  seed?: TourCompletion[];
  currentRoute?: string;
}) {
  const storage = memoryTourStorage(options.seed ?? []);
  render(
    <TourProvider
      tours={options.tours ?? TOURS}
      storage={storage}
      defaults={{ anchorTimeoutMs: 60, scrollIntoView: false }}
      {...(options.currentRoute === undefined ? {} : { currentRoute: options.currentRoute })}
    >
      <Controls />
    </TourProvider>,
  );
  return storage;
}

beforeEach(() => {
  document.body.insertAdjacentHTML(
    "beforeend",
    '<div id="page"><button data-tour="one">One</button><button data-tour="two">Two</button></div>',
  );
});

afterEach(() => {
  document.getElementById("page")?.remove();
  vi.restoreAllMocks();
});

describe("TourProvider", () => {
  it("renders nothing until a tour is started", () => {
    renderProvider({});

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByTestId("state")).toHaveTextContent("none:0:0");
  });

  it("starts a tour and exposes its position", async () => {
    renderProvider({});

    fireEvent.click(screen.getByText("start"));

    expect(await screen.findByText("Stop one")).toBeInTheDocument();
    expect(screen.getByTestId("state")).toHaveTextContent("first-hour:0:2");
  });

  it("jumps straight to a named step", async () => {
    renderProvider({});

    fireEvent.click(screen.getByText("start at two"));

    expect(await screen.findByText("Stop two")).toBeInTheDocument();
  });

  it("advances programmatically", async () => {
    renderProvider({});
    fireEvent.click(screen.getByText("start"));
    await screen.findByText("Stop one");

    fireEvent.click(screen.getByText("next"));

    expect(await screen.findByText("Stop two")).toBeInTheDocument();
  });

  it("records a completion and closes the tour", async () => {
    const storage = renderProvider({});
    fireEvent.click(screen.getByText("start"));
    await screen.findByText("Stop one");

    fireEvent.click(screen.getByText("finish"));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(storage.read()).toMatchObject([{ tourId: "first-hour", status: "completed" }]);
  });

  it("refuses to restart a finished tour", async () => {
    renderProvider({ seed: [completion()] });
    await waitFor(() => expect(screen.getByTestId("finished")).toHaveTextContent("true"));

    fireEvent.click(screen.getByText("start"));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("restarts a finished tour when forced, which is what a 'Take a tour' button does", async () => {
    renderProvider({ seed: [completion()] });
    await waitFor(() => expect(screen.getByTestId("finished")).toHaveTextContent("true"));

    fireEvent.click(screen.getByText("start forced"));

    expect(await screen.findByText("Stop one")).toBeInTheDocument();
  });

  it("treats a completion at an older version as stale so a reworked tour is offered again", async () => {
    renderProvider({
      tours: [{ ...TOURS[0]!, version: 2 }],
      seed: [completion({ version: 1 })],
    });

    await waitFor(() => expect(screen.getByTestId("finished")).toHaveTextContent("false"));
  });

  it("makes tours eligible again after a reset", async () => {
    renderProvider({ seed: [completion()] });
    await waitFor(() => expect(screen.getByTestId("finished")).toHaveTextContent("true"));

    fireEvent.click(screen.getByText("reset"));

    await waitFor(() => expect(screen.getByTestId("finished")).toHaveTextContent("false"));
  });

  it("auto-starts an eligible tour on its declared route", async () => {
    renderProvider({
      tours: [{ ...TOURS[0]!, autoStart: true, autoStartRoute: "/" }],
      currentRoute: "/",
    });

    expect(await screen.findByText("Stop one")).toBeInTheDocument();
  });

  it("does not auto-start on another route", async () => {
    renderProvider({
      tours: [{ ...TOURS[0]!, autoStart: true, autoStartRoute: "/" }],
      currentRoute: "/settings",
    });

    await waitFor(() => expect(screen.getByTestId("finished")).toHaveTextContent("false"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("does not auto-start a tour the user already dismissed", async () => {
    renderProvider({
      tours: [{ ...TOURS[0]!, autoStart: true, autoStartRoute: "/" }],
      seed: [completion({ status: "dismissed" })],
      currentRoute: "/",
    });

    await waitFor(() => expect(screen.getByTestId("finished")).toHaveTextContent("true"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("rejects an unknown tour id rather than silently doing nothing", () => {
    let api: ReturnType<typeof useTour> | null = null;
    function Capture() {
      api = useTour();
      return null;
    }
    render(
      <TourProvider tours={TOURS} storage={memoryTourStorage()}>
        <Capture />
      </TourProvider>,
    );

    // Called outside React's event system: an exception thrown inside a handler
    // is routed to React's unhandled-error path instead of back to the caller.
    expect(() => api!.start("nope")).toThrow(/Unknown tour "nope"/);
  });

  it("refuses to run outside a provider", () => {
    function Orphan() {
      useTour();
      return null;
    }
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => render(<Orphan />)).toThrow(/must be used within a <TourProvider>/);
  });
});
