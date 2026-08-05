import { useState } from "react";
import {
  Button,
  TourProvider,
  memoryTourStorage,
  useTour,
  type TourDefinition,
  type TourStorage,
} from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

const DASHBOARD_TOUR: TourDefinition = {
  id: "kitchen-sink-dashboard",
  title: "Dashboard overview",
  steps: [
    {
      id: "environment",
      title: "Choose an environment",
      body: "Confirm the environment before interpreting the dashboard.",
      target: '[data-tour="demo-environment"]',
      placement: "bottom",
    },
    {
      id: "search",
      title: "Search the workspace",
      body: "Search stays available while the tour highlights the surrounding workflow.",
      target: '[data-tour="demo-search"]',
      placement: "bottom",
    },
    {
      id: "activity",
      title: "Inspect activity",
      body: "The activity panel is the quickest route from a summary count to a failed run.",
      target: '[data-tour="demo-activity"]',
    },
  ],
};

function TourControls() {
  const tour = useTour();
  return (
    <>
      <div className="flex flex-wrap items-center gap-density-2">
        <Button onClick={() => tour.start(DASHBOARD_TOUR.id, { force: true })}>
          Take the tour
        </Button>
        <Button variant="outline" onClick={() => tour.reset(DASHBOARD_TOUR.id)}>
          Reset completion
        </Button>
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {tour.tourId ? `Step ${tour.index + 1} of ${tour.total} · ${tour.status}` : "Tour idle"}
        </span>
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-density-4">
        <header className="flex flex-wrap items-center gap-density-3">
          <strong className="text-sm">Operations dashboard</strong>
          <button
            type="button"
            data-tour="demo-environment"
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          >
            QA environment
          </button>
          <input
            data-tour="demo-search"
            aria-label="Search the workspace"
            placeholder="Search anything"
            className="min-w-48 flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          />
        </header>
        <div className="mt-density-4 grid gap-density-3 sm:grid-cols-3">
          <article className="rounded-md border border-border bg-background p-density-3">
            <h3 className="text-sm font-medium">Cycles</h3>
            <p className="mt-1 text-xs text-muted-foreground">4 runs in the last hour</p>
          </article>
          <article className="rounded-md border border-border bg-background p-density-3">
            <h3 className="text-sm font-medium">Data intake</h3>
            <p className="mt-1 text-xs text-muted-foreground">2 files pending</p>
          </article>
          <article
            data-tour="demo-activity"
            className="rounded-md border border-border bg-background p-density-3"
          >
            <h3 className="text-sm font-medium">Activity</h3>
            <p className="mt-1 text-xs text-muted-foreground">1 failed run</p>
          </article>
        </div>
      </div>
    </>
  );
}

export function TourDemo() {
  const [storage] = useState<TourStorage>(() => memoryTourStorage());
  return (
    <DemoSection
      id="tour"
      title="Tour"
      description="Provider-managed guided tours with anchored steps, keyboard navigation, completion tracking, and replay controls."
    >
      <TourProvider tours={[DASHBOARD_TOUR]} storage={storage}>
        <TourControls />
      </TourProvider>
    </DemoSection>
  );
}
