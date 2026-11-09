import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import type { BuildStep } from "@flanksource/page-runtime/host";
import { RuntimeTimings } from "./RuntimeTimings";

afterEach(cleanup);

const STARTED = 1_700_000_000_000;
const STEPS: BuildStep[] = [
  { label: "Resolve page dependencies", source: "host", at: STARTED },
  { label: "Prepare runtime and links", source: "host", at: STARTED + 2_500 },
  { label: "Load failed", source: "host", at: STARTED + 2_750, error: "boom" },
];

it("offers the per-step durations of a failed load behind a collapsed Timings disclosure", () => {
  render(<RuntimeTimings steps={STEPS} load={null} />);
  const disclosure = screen.getByText("Timings").closest("details")!;
  expect(disclosure.open).toBe(false);
  fireEvent.click(screen.getByText("Timings"));
  expect(disclosure.open).toBe(true);
  const log = within(disclosure).getByRole("log", { name: "Build log" });
  expect(within(log).getAllByRole("listitem").map(item => item.textContent)).toEqual([
    "+0.00shostResolve page dependencies2.5 s",
    "+2.50shostPrepare runtime and links250 ms",
    "+2.75shostLoad failed: boom0 ms",
  ]);
});

it("renders nothing when no step was recorded", () => {
  const { container } = render(<RuntimeTimings steps={[]} load={null} />);
  expect(container.innerHTML).toBe("");
});
