import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Tour } from "./Tour";
import { TourProvider } from "./TourProvider";
import { useTour } from "./tour-context";
import { memoryTourStorage, type TourStorage } from "./tour-progress";
import type { TourDefinition } from "./tour-types";

const meta: Meta<typeof Tour> = {
  title: "Overlay/Tour",
  component: Tour,
  parameters: { layout: "fullscreen" },
  argTypes: {
    missingAnchor: {
      control: "inline-radio",
      options: ["center", "skip", "fail"],
      description: "What happens when a step's anchor never appears.",
      table: { category: "Behavior", defaultValue: { summary: "center" } },
    },
    interaction: {
      control: "inline-radio",
      options: ["allow-anchor", "block-all", "allow-all"],
      description: "Pointer behaviour of the dim layer.",
      table: { category: "Behavior", defaultValue: { summary: "allow-anchor" } },
    },
    padding: {
      control: { type: "number" },
      description: "Spotlight padding around the anchor, in px.",
      table: { category: "Layout", defaultValue: { summary: "8" } },
    },
    keyboard: { control: "boolean", table: { category: "Behavior" } },
    closeOnEsc: { control: "boolean", table: { category: "Behavior" } },
  },
};

export default meta;
type Story = StoryObj<typeof Tour>;

/** A small mock app the tour points at. */
function MockPage({ extra }: { extra?: ReactNode }) {
  return (
    <div className="min-h-screen bg-background p-density-6 text-foreground">
      <header className="mb-density-6 flex items-center gap-density-4 rounded-lg border border-border p-density-4">
        <span className="font-semibold">Mission Control</span>
        <button data-tour="environment" className="rounded-md border border-border px-3 py-1 text-sm">
          QA environment
        </button>
        <input
          data-tour="search"
          placeholder="Search anything"
          className="ml-auto rounded-md border border-border px-3 py-1 text-sm"
        />
      </header>
      <div className="grid grid-cols-3 gap-density-4">
        <section data-tour="cycles" className="rounded-lg border border-border p-density-4">
          <h2 className="text-sm font-semibold">Cycles</h2>
          <p className="mt-2 text-xs text-muted-foreground">4 runs in the last hour</p>
        </section>
        <section data-tour="intake" className="rounded-lg border border-border p-density-4">
          <h2 className="text-sm font-semibold">Data intake</h2>
          <p className="mt-2 text-xs text-muted-foreground">2 files pending</p>
        </section>
        <section data-tour="activities" className="rounded-lg border border-border p-density-4">
          <h2 className="text-sm font-semibold">Activities</h2>
          <p className="mt-2 text-xs text-muted-foreground">1 failed</p>
        </section>
      </div>
      {extra}
    </div>
  );
}

const DASHBOARD_TOUR: TourDefinition = {
  id: "dashboard",
  title: "Dashboard tour",
  steps: [
    {
      id: "environment",
      title: "Choose an environment",
      body: "Every page reads from one environment at a time. Check it before you trust a number.",
      target: '[data-tour="environment"]',
      placement: "bottom",
    },
    {
      id: "panels",
      title: "Scan the panels",
      body: "Each panel shows its last few runs, so a level that never ran is visible as a gap.",
      target: '[data-tour="cycles"]',
    },
    {
      id: "failures",
      title: "Find the failure",
      body: "Activities counts terminal failures — this is where 'something is wrong' becomes a name.",
      target: '[data-tour="activities"]',
    },
  ],
};

/** Drives the controlled `Tour` the way a provider would. */
function Driven({ definition, ...props }: { definition: TourDefinition } & Partial<Parameters<typeof Tour>[0]>) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(true);
  if (!open) {
    return (
      <MockPage
        extra={
          <button
            className="mt-density-6 rounded-md border border-border px-3 py-1 text-sm"
            onClick={() => {
              setIndex(0);
              setOpen(true);
            }}
          >
            Take the tour
          </button>
        }
      />
    );
  }
  return (
    <>
      <MockPage />
      <Tour
        {...props}
        definition={definition}
        index={index}
        onIndexChange={setIndex}
        onComplete={() => setOpen(false)}
        onDismiss={() => setOpen(false)}
      />
    </>
  );
}

export const Default: Story = {
  render: () => <Driven definition={DASHBOARD_TOUR} />,
};

function ProviderControls() {
  const tour = useTour();
  return (
    <MockPage
      extra={
        <div className="mt-density-6 flex items-center gap-density-3">
          <button
            type="button"
            className="rounded-md border border-border px-3 py-1 text-sm"
            onClick={() => tour.start(DASHBOARD_TOUR.id, { force: true })}
          >
            Take the tour
          </button>
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {tour.tourId ? `Step ${tour.index + 1} of ${tour.total} · ${tour.status}` : "Tour idle"}
          </span>
        </div>
      }
    />
  );
}

/** The application-level API: register once, then start or inspect tours through `useTour()`. */
export const ProviderManaged: Story = {
  render: function ProviderManagedStory() {
    const [storage] = useState<TourStorage>(() => memoryTourStorage());
    return (
      <TourProvider tours={[DASHBOARD_TOUR]} storage={storage}>
        <ProviderControls />
      </TourProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Take the tour" }));

    const page = within(document.body);
    await expect(
      await page.findByRole("dialog", { name: "Choose an environment" }),
    ).toBeInTheDocument();
    await userEvent.click(page.getByRole("button", { name: "Next" }));
    await expect(
      await page.findByRole("dialog", { name: "Scan the panels" }),
    ).toBeInTheDocument();
  },
};

/** A step whose anchor never appears still shows, centred, and warns. */
export const MissingAnchor: Story = {
  render: () => (
    <Driven
      definition={{
        id: "missing",
        steps: [
          {
            id: "gone",
            title: "This anchor does not exist",
            body: "The card centres itself and the tour warns rather than dropping the stop.",
            target: "#never-exists",
          },
          ...DASHBOARD_TOUR.steps,
        ],
      }}
      anchorTimeoutMs={600}
    />
  ),
};

/** A step gated on the operator: the hint shows and Next stays disabled. */
export const BlockedOnOperator: Story = {
  render: () => (
    <Driven
      definition={{
        id: "blocked",
        steps: [
          {
            id: "waiting",
            title: "Open a plan",
            body: "This stop needs something only the operator can do.",
            target: "#not-yet",
            hint: "Open a plan from the tree to continue.",
          },
        ],
      }}
      anchorTimeoutMs={600}
    />
  ),
};

/** An anchor that mounts after the step is entered — the wait must catch it. */
export const LateAnchor: Story = {
  render: function LateAnchorStory() {
    const [ready, setReady] = useState(false);
    useEffect(() => {
      const timer = setTimeout(() => setReady(true), 800);
      return () => clearTimeout(timer);
    }, []);
    const [index, setIndex] = useState(0);
    return (
      <>
        <MockPage
          extra={
            ready ? (
              <div data-tour="late" className="mt-density-6 rounded-lg border border-border p-density-4">
                Loaded after the step was entered
              </div>
            ) : (
              <p className="mt-density-6 text-xs text-muted-foreground">Loading…</p>
            )
          }
        />
        <Tour
          definition={{
            id: "late",
            steps: [
              {
                id: "late",
                title: "Waited for this",
                body: "The anchor mounted 800ms after the step opened.",
                target: '[data-tour="late"]',
              },
            ],
          }}
          index={index}
          onIndexChange={setIndex}
          onComplete={() => undefined}
          onDismiss={() => undefined}
        />
      </>
    );
  },
};

/** Markdown bodies render through the lazily loaded `Markdown`. */
export const MarkdownBody: Story = {
  render: () => (
    <Driven
      definition={{
        id: "markdown",
        steps: [
          {
            id: "md",
            title: "Markdown body",
            markdown: "Paste an **ActivityGUID**, a comma-list, or raw log text.\n\n- one\n- two",
            target: '[data-tour="search"]',
          },
        ],
      }}
    />
  ),
};

/**
 * The hard constraint: the same steps run over a UI mounted in a shadow root,
 * where a `document`-scoped lookup finds nothing.
 */
export const InsideShadowRoot: Story = {
  render: function ShadowStory() {
    const hostRef = useRef<HTMLDivElement>(null);
    const [shadow, setShadow] = useState<ShadowRoot | null>(null);
    const [index, setIndex] = useState(0);

    useEffect(() => {
      const host = hostRef.current;
      if (!host || host.shadowRoot) return;
      const root = host.attachShadow({ mode: "open" });
      const mount = document.createElement("div");
      mount.innerHTML = `
        <style>
          .panel { border: 1px solid #888; border-radius: 8px; padding: 16px; font: 14px system-ui; }
          .row { display: flex; gap: 12px; margin-bottom: 12px; }
        </style>
        <div class="row">
          <div class="panel" data-tour="mock-a">Mock panel A</div>
          <div class="panel" data-tour="mock-b">Mock panel B</div>
        </div>
        <div id="tour-portal"></div>
      `;
      root.appendChild(mount);
      setShadow(root);
    }, []);

    const portal = shadow?.querySelector<HTMLElement>("#tour-portal") ?? null;

    return (
      <div className="min-h-screen bg-background p-density-6">
        <p className="mb-density-4 text-sm text-muted-foreground">
          The panels below live in a shadow root. The tour is scoped to it.
        </p>
        <div ref={hostRef} />
        {shadow ? (
          <Tour
            definition={{
              id: "shadow",
              steps: [
                { id: "a", title: "Panel A", body: "Found inside the shadow root.", target: '[data-tour="mock-a"]' },
                { id: "b", title: "Panel B", body: "So is this one.", target: '[data-tour="mock-b"]' },
              ],
            }}
            index={index}
            onIndexChange={setIndex}
            onComplete={() => undefined}
            onDismiss={() => undefined}
            anchorRoot={shadow}
            {...(portal ? { portalContainer: portal } : {})}
          />
        ) : null}
      </div>
    );
  },
};
