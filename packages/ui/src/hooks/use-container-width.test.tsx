import { render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useContainerWiderThan } from "./use-container-width";

const THRESHOLD = 560;

let notify: (() => void) | undefined;
let observed: Element[] = [];
let originalResizeObserver: typeof ResizeObserver;

class RecordingResizeObserver implements ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    notify = () => callback([], this);
  }
  observe(target: Element) {
    observed.push(target);
  }
  unobserve() {}
  disconnect() {
    notify = undefined;
  }
}

function widen(node: HTMLElement, width: number) {
  vi.spyOn(node, "getBoundingClientRect").mockReturnValue({
    width,
  } as DOMRect);
}

function Probe({ width }: { width: number | undefined }) {
  const renders = useRenderCount();
  const { ref, wider } = useContainerWiderThan(THRESHOLD);
  return (
    <div
      data-testid="probe"
      ref={(node) => {
        if (node && width !== undefined) widen(node, width);
        ref(node);
      }}
    >
      {String(wider)}:{renders}
    </div>
  );
}

let renderCount = 0;
function useRenderCount() {
  renderCount += 1;
  return renderCount;
}

beforeEach(() => {
  renderCount = 0;
  observed = [];
  originalResizeObserver = globalThis.ResizeObserver;
  globalThis.ResizeObserver = RecordingResizeObserver;
});

afterEach(() => {
  globalThis.ResizeObserver = originalResizeObserver;
  vi.restoreAllMocks();
});

describe("useContainerWiderThan", () => {
  it("reports wider for an unmeasured element so the roomy layout is the default", () => {
    render(<Probe width={undefined} />);

    expect(screen.getByTestId("probe")).toHaveTextContent(/^true:/);
    expect(observed).toEqual([screen.getByTestId("probe")]);
  });

  it.each([
    { width: THRESHOLD - 1, wider: false },
    { width: THRESHOLD, wider: true },
    { width: THRESHOLD + 1, wider: true },
  ])("reports wider=$wider at width $width", ({ width, wider }) => {
    render(<Probe width={width} />);

    expect(screen.getByTestId("probe")).toHaveTextContent(
      new RegExp(`^${String(wider)}:`),
    );
  });

  it("flips when a resize crosses the threshold and stays put within one band", () => {
    render(<Probe width={THRESHOLD + 200} />);
    const probe = screen.getByTestId("probe");
    const rendersWhenRoomy = Number(probe.textContent?.split(":")[1]);

    widen(probe, THRESHOLD + 100);
    act(() => notify?.());
    expect(probe).toHaveTextContent(`true:${rendersWhenRoomy}`);

    widen(probe, THRESHOLD - 100);
    act(() => notify?.());
    expect(probe).toHaveTextContent(/^false:/);
    const rendersWhenNarrow = Number(probe.textContent?.split(":")[1]);
    expect(rendersWhenNarrow).toBeGreaterThan(rendersWhenRoomy);

    widen(probe, THRESHOLD - 200);
    act(() => notify?.());
    expect(probe).toHaveTextContent(`false:${rendersWhenNarrow}`);
  });
});
