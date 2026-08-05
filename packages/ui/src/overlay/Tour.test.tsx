import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { Tour } from "./Tour";
import type { TourDefinition, TourStepErrorInfo } from "./tour-types";

const ANCHORS = `
  <button data-tour="one">One</button>
  <button data-tour="two">Two</button>
`;

function definition(overrides: Partial<TourDefinition> = {}): TourDefinition {
  return {
    id: "demo",
    steps: [
      { id: "first", title: "First stop", body: "Look here", target: '[data-tour="one"]' },
      { id: "second", title: "Second stop", body: "Now here", target: '[data-tour="two"]' },
    ],
    ...overrides,
  };
}

/** Drives `Tour` the way a provider would, so Next/Back actually move. */
function Harness(props: {
  definition: TourDefinition;
  onComplete?: () => void;
  onDismiss?: () => void;
  onStepError?: (info: TourStepErrorInfo) => void;
  onNavigate?: (route: string) => void;
  anchorTimeoutMs?: number;
}) {
  const [index, setIndex] = useState(0);
  return (
    <Tour
      definition={props.definition}
      index={index}
      onIndexChange={setIndex}
      onComplete={props.onComplete ?? (() => undefined)}
      onDismiss={props.onDismiss ?? (() => undefined)}
      anchorTimeoutMs={props.anchorTimeoutMs ?? 80}
      scrollIntoView={false}
      {...(props.onStepError ? { onStepError: props.onStepError } : {})}
      {...(props.onNavigate ? { onNavigate: props.onNavigate } : {})}
    />
  );
}

beforeEach(() => {
  document.body.insertAdjacentHTML("beforeend", `<div id="page">${ANCHORS}</div>`);
});

afterEach(() => {
  document.getElementById("page")?.remove();
  vi.restoreAllMocks();
});

describe("Tour", () => {
  it("renders the first step as a non-modal dialog", async () => {
    render(<Harness definition={definition()} />);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("First stop");
    expect(dialog).toHaveTextContent("Look here");
    // No aria-modal: it would hide the very element the step describes from
    // assistive technology.
    expect(dialog).not.toHaveAttribute("aria-modal");
  });

  it("shows the position among the steps", async () => {
    render(<Harness definition={definition()} />);

    expect(await screen.findByText("1 of 2")).toBeInTheDocument();
  });

  it("marks the spotlit element so styles and e2e can find it", async () => {
    render(<Harness definition={definition()} />);

    await waitFor(() =>
      expect(document.querySelector('[data-tour="one"]')).toHaveAttribute("data-tour-active", "true"),
    );
  });

  it("moves forward and back between steps", async () => {
    render(<Harness definition={definition()} />);
    await screen.findByText("First stop");

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Second stop")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(await screen.findByText("First stop")).toBeInTheDocument();
  });

  it("completes from the last step rather than offering another Next", async () => {
    const onComplete = vi.fn();
    render(<Harness definition={definition()} onComplete={onComplete} />);

    fireEvent.click(await screen.findByRole("button", { name: "Next" }));
    fireEvent.click(await screen.findByRole("button", { name: "Done" }));

    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("dismisses from Skip", async () => {
    const onDismiss = vi.fn();
    render(<Harness definition={definition()} onDismiss={onDismiss} />);

    fireEvent.click(await screen.findByRole("button", { name: "Skip tour" }));

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("dismisses on Escape", async () => {
    const onDismiss = vi.fn();
    render(<Harness definition={definition()} onDismiss={onDismiss} />);
    await screen.findByText("First stop");

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("advances and retreats with the arrow keys", async () => {
    render(<Harness definition={definition()} />);
    await screen.findByText("First stop");

    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(await screen.findByText("Second stop")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(await screen.findByText("First stop")).toBeInTheDocument();
  });

  it("announces each step in a polite live region", async () => {
    render(<Harness definition={definition()} />);

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("Step 1 of 2: First stop");
  });

  it("asks the host to navigate once for a step on another route", async () => {
    const onNavigate = vi.fn();
    const routed = definition({
      steps: [
        {
          id: "elsewhere",
          title: "Elsewhere",
          route: "/other",
          target: '[data-tour="one"]',
        },
      ],
    });
    render(<Harness definition={routed} onNavigate={onNavigate} />);
    await screen.findByText("Elsewhere");

    expect(onNavigate).toHaveBeenCalledOnce();
    expect(onNavigate).toHaveBeenCalledWith("/other", expect.anything());
  });

  describe("when an anchor never appears", () => {
    const broken = definition({
      steps: [{ id: "gone", title: "Gone", body: "Missing anchor", target: "#absent" }],
    });

    it("still shows the step, centred, rather than dropping it", async () => {
      vi.spyOn(console, "warn").mockImplementation(() => undefined);
      render(<Harness definition={broken} />);

      expect(await screen.findByText("Gone")).toBeInTheDocument();
      await waitFor(() => expect(console.warn).toHaveBeenCalled());
    });

    it("reports it so a host can escalate in development", async () => {
      vi.spyOn(console, "warn").mockImplementation(() => undefined);
      const onStepError = vi.fn();
      render(<Harness definition={broken} onStepError={onStepError} />);

      await waitFor(() => expect(onStepError).toHaveBeenCalled());
      expect(onStepError.mock.calls[0]?.[0]).toMatchObject({
        tourId: "demo",
        reason: "anchor-timeout",
        target: "#absent",
      });
    });

    it("still lets the operator finish a tour that ENDS on a waiting step", async () => {
      vi.spyOn(console, "warn").mockImplementation(() => undefined);
      const onComplete = vi.fn();
      const endsWaiting = definition({
        steps: [
          { id: "last", title: "Last", target: "#absent", hint: "Run a plan to see evidence." },
        ],
      });
      render(<Harness definition={endsWaiting} onComplete={onComplete} />);
      await screen.findByText("Run a plan to see evidence.");

      // Done ends the tour rather than moving to an unreachable stop, so blocking
      // it would leave abandoning the tour as the only way out.
      const done = screen.getByRole("button", { name: "Done" });
      expect(done).toBeEnabled();
      fireEvent.click(done);

      expect(onComplete).toHaveBeenCalledOnce();
    });

    it("blocks Next and shows the hint when the step waits on the operator", async () => {
      vi.spyOn(console, "warn").mockImplementation(() => undefined);
      const gated = definition({
        steps: [
          {
            id: "gated",
            title: "Gated",
            target: "#absent",
            hint: "Open a plan from the tree to continue.",
          },
          { id: "after", title: "After", target: '[data-tour="two"]' },
        ],
      });
      render(<Harness definition={gated} />);

      expect(await screen.findByText("Open a plan from the tree to continue.")).toBeInTheDocument();
      // Advancing anyway would narrate a stop the operator never reached.
      expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    });
  });

  it("shows the tour's footer on every step, linking back to its written guide", async () => {
    const documented = definition({ footer: <a href="/docs/first-hour/">Read the full guide</a> });
    render(<Harness definition={documented} />);
    await screen.findByText("First stop");

    expect(screen.getByRole("link", { name: "Read the full guide" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("Second stop");

    // Every step, not just the first: the operator may want the guide at any stop.
    expect(screen.getByRole("link", { name: "Read the full guide" })).toBeInTheDocument();
  });

  it("renders a step whose target is a resolver", async () => {
    const resolved = definition({
      steps: [
        {
          id: "resolver",
          title: "By resolver",
          target: (root) => root.querySelector<HTMLElement>('[data-tour="two"]'),
        },
      ],
    });
    render(<Harness definition={resolved} />);

    expect(await screen.findByText("By resolver")).toBeInTheDocument();
  });

  it("finds anchors inside a shadow root when given one", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: "open" });
    const mount = document.createElement("div");
    shadow.appendChild(mount);
    mount.insertAdjacentHTML("beforeend", '<div data-tour="mock">Mock</div>');

    const scoped: TourDefinition = {
      id: "shadow",
      steps: [{ id: "only", title: "In the shadow", target: '[data-tour="mock"]' }],
    };

    render(
      <Tour
        definition={scoped}
        index={0}
        onIndexChange={() => undefined}
        onComplete={() => undefined}
        onDismiss={() => undefined}
        anchorRoot={shadow}
        anchorTimeoutMs={200}
        scrollIntoView={false}
      />,
    );

    await waitFor(() =>
      expect(shadow.querySelector('[data-tour="mock"]')).toHaveAttribute("data-tour-active", "true"),
    );
    act(() => host.remove());
  });
});
